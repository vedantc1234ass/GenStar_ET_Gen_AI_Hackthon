import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { tasksTable, employeesTable, workflowsTable, auditLogsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { workflowId, employeeId, status } = req.query;
    let query = db.select().from(tasksTable);
    const conditions = [];
    if (workflowId) conditions.push(eq(tasksTable.workflowId, parseInt(workflowId as string)));
    if (employeeId) conditions.push(eq(tasksTable.assigneeId, parseInt(employeeId as string)));
    if (status) conditions.push(eq(tasksTable.status, status as "pending" | "in_progress" | "completed" | "failed" | "blocked" | "escalated"));

    const tasks = conditions.length > 0
      ? await db.select().from(tasksTable).where(and(...conditions))
      : await db.select().from(tasksTable);

    const result = await Promise.all(tasks.map(async (task) => {
      let assigneeName: string | undefined;
      if (task.assigneeId) {
        const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, task.assigneeId));
        assigneeName = emp?.name;
      }
      return { ...task, assigneeName };
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err, "Error fetching tasks");
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { workflowId, title, description, priority, assigneeId, agentType, dependencies, deadline } = req.body;
    if (!title || !description || !priority) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const riskScore = Math.round(Math.random() * 60 * 10) / 10;
    const [task] = await db.insert(tasksTable).values({
      workflowId: workflowId ? parseInt(workflowId) : undefined,
      title, description, priority,
      assigneeId: assigneeId ? parseInt(assigneeId) : undefined,
      agentType,
      dependencies: dependencies || [],
      deadline: deadline ? new Date(deadline) : undefined,
      riskScore,
    }).returning();

    if (workflowId) {
      const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, parseInt(workflowId)));
      await db.update(workflowsTable).set({ taskCount: allTasks.length, updatedAt: new Date() }).where(eq(workflowsTable.id, parseInt(workflowId)));
    }

    let assigneeName: string | undefined;
    if (task.assigneeId) {
      const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, task.assigneeId));
      assigneeName = emp?.name;
    }
    res.status(201).json({ ...task, assigneeName });
  } catch (err) {
    req.log.error(err, "Error creating task");
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, id));
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    let assigneeName: string | undefined;
    if (task.assigneeId) {
      const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, task.assigneeId));
      assigneeName = emp?.name;
    }
    res.json({ ...task, assigneeName });
  } catch (err) {
    req.log.error(err, "Error fetching task");
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    const allowed = ["title", "description", "status", "priority", "assigneeId", "agentType", "dependencies", "deadline", "notes"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (key === "deadline") updates[key] = new Date(req.body[key]);
        else if (key === "assigneeId") updates[key] = parseInt(req.body[key]);
        else updates[key] = req.body[key];
      }
    }
    if (req.body.status === "completed") {
      updates.completedAt = new Date();
    }
    updates.updatedAt = new Date();
    const [task] = await db.update(tasksTable).set(updates).where(eq(tasksTable.id, id)).returning();
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    if (task.workflowId && req.body.status === "completed") {
      const allTasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, task.workflowId));
      const completedCount = allTasks.filter(t => t.status === "completed").length;
      await db.update(workflowsTable).set({ completedTasks: completedCount, updatedAt: new Date() }).where(eq(workflowsTable.id, task.workflowId));

      if (task.assigneeId) {
        const [emp] = await db.select().from(employeesTable).where(eq(employeesTable.id, task.assigneeId));
        if (emp) {
          const newCompleted = emp.tasksCompleted + 1;
          const newProductivity = Math.round((newCompleted * emp.qualityScore) / Math.max(emp.idleTime + 1, 1));
          await db.update(employeesTable).set({
            tasksCompleted: newCompleted,
            productivityScore: Math.min(newProductivity, 100),
            updatedAt: new Date(),
          }).where(eq(employeesTable.id, task.assigneeId));
        }
      }

      await db.insert(auditLogsTable).values({
        agentType: "verification",
        action: "task_completed",
        entityType: "task",
        entityId: id,
        details: { taskTitle: task.title },
        reasoning: "Task marked as completed. Verification agent confirmed data validity.",
        status: "success",
      });
    }

    let assigneeName: string | undefined;
    if (task.assigneeId) {
      const [emp] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, task.assigneeId));
      assigneeName = emp?.name;
    }
    res.json({ ...task, assigneeName });
  } catch (err) {
    req.log.error(err, "Error updating task");
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.id, id));
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    req.log.error(err, "Error deleting task");
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
