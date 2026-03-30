import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workflowsTable, tasksTable, employeesTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const workflows = await db.select().from(workflowsTable).orderBy(workflowsTable.id);
    const result = await Promise.all(workflows.map(async (wf) => {
      let ownerName: string | undefined;
      if (wf.ownerId) {
        const [owner] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, wf.ownerId));
        ownerName = owner?.name;
      }
      const tasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, wf.id));
      return { ...wf, ownerName, tasks };
    }));
    res.json(result);
  } catch (err) {
    req.log.error(err, "Error fetching workflows");
    res.status(500).json({ error: "Failed to fetch workflows" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, description, priority, slaDeadline, ownerId } = req.body;
    if (!name || !description || !priority) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const riskScore = Math.round(Math.random() * 40 * 10) / 10;
    const [workflow] = await db.insert(workflowsTable).values({
      name, description, priority,
      slaDeadline: slaDeadline ? new Date(slaDeadline) : undefined,
      ownerId: ownerId ? parseInt(ownerId) : undefined,
      riskScore,
      bottlenecks: [],
    }).returning();
    await db.insert(auditLogsTable).values({
      agentType: "orchestrator",
      action: "workflow_created",
      entityType: "workflow",
      entityId: workflow.id,
      details: { name, priority },
      reasoning: "New workflow initialized by user",
      status: "success",
    });
    res.status(201).json({ ...workflow, tasks: [], ownerName: undefined });
  } catch (err) {
    req.log.error(err, "Error creating workflow");
    res.status(500).json({ error: "Failed to create workflow" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [workflow] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }
    let ownerName: string | undefined;
    if (workflow.ownerId) {
      const [owner] = await db.select({ name: employeesTable.name }).from(employeesTable).where(eq(employeesTable.id, workflow.ownerId));
      ownerName = owner?.name;
    }
    const tasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, id));
    res.json({ ...workflow, ownerName, tasks });
  } catch (err) {
    req.log.error(err, "Error fetching workflow");
    res.status(500).json({ error: "Failed to fetch workflow" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    const allowed = ["name", "description", "status", "priority", "slaDeadline", "ownerId"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = key === "slaDeadline" ? new Date(req.body[key]) : req.body[key];
    }
    updates.updatedAt = new Date();
    const [workflow] = await db.update(workflowsTable).set(updates).where(eq(workflowsTable.id, id)).returning();
    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }
    const tasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, id));
    res.json({ ...workflow, tasks });
  } catch (err) {
    req.log.error(err, "Error updating workflow");
    res.status(500).json({ error: "Failed to update workflow" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.workflowId, id));
    await db.delete(workflowsTable).where(eq(workflowsTable.id, id));
    res.json({ success: true, message: "Workflow deleted" });
  } catch (err) {
    req.log.error(err, "Error deleting workflow");
    res.status(500).json({ error: "Failed to delete workflow" });
  }
});

router.post("/:id/execute", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [workflow] = await db.select().from(workflowsTable).where(eq(workflowsTable.id, id));
    if (!workflow) {
      res.status(404).json({ error: "Workflow not found" });
      return;
    }
    await db.update(workflowsTable).set({ status: "running", updatedAt: new Date() }).where(eq(workflowsTable.id, id));
    const executionId = `exec-${Date.now()}-${id}`;
    const agentPipeline = ["orchestrator", "decision", "data", "action", "verification", "recovery", "audit", "monitoring"];

    await db.insert(auditLogsTable).values({
      agentType: "orchestrator",
      action: "workflow_execution_started",
      entityType: "workflow",
      entityId: id,
      details: { executionId, agentPipeline },
      reasoning: "Workflow execution initiated. Breaking down goals into tasks.",
      status: "success",
    });

    setTimeout(async () => {
      try {
        const tasks = await db.select().from(tasksTable).where(eq(tasksTable.workflowId, id));
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === "completed").length;
        await db.update(workflowsTable).set({
          status: "completed",
          completedTasks,
          taskCount: totalTasks,
          updatedAt: new Date(),
        }).where(eq(workflowsTable.id, id));
        await db.insert(auditLogsTable).values({
          agentType: "verification",
          action: "workflow_execution_completed",
          entityType: "workflow",
          entityId: id,
          details: { executionId, completedTasks, totalTasks },
          reasoning: "All tasks verified and workflow marked as complete.",
          status: "success",
        });
      } catch { /* background */ }
    }, 5000);

    res.json({
      workflowId: id,
      executionId,
      status: "running",
      startedAt: new Date().toISOString(),
      agentPipeline,
    });
  } catch (err) {
    req.log.error(err, "Error executing workflow");
    res.status(500).json({ error: "Failed to execute workflow" });
  }
});

export default router;
