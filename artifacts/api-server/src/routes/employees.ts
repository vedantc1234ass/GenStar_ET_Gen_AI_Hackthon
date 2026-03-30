import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { employeesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const employees = await db.select().from(employeesTable).orderBy(employeesTable.id);
    res.json(employees);
  } catch (err) {
    req.log.error(err, "Error fetching employees");
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, role, department } = req.body;
    if (!name || !email || !role || !department) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    const [employee] = await db.insert(employeesTable).values({
      name, email, role, department,
      productivityScore: Math.round(60 + Math.random() * 40),
      tasksCompleted: Math.floor(Math.random() * 20),
      tasksInProgress: Math.floor(Math.random() * 5),
      errorRate: Math.round(Math.random() * 10 * 10) / 10,
      idleTime: Math.round(Math.random() * 2 * 10) / 10,
      qualityScore: Math.round(75 + Math.random() * 25),
    }).returning();
    res.status(201).json(employee);
  } catch (err) {
    req.log.error(err, "Error creating employee");
    res.status(500).json({ error: "Failed to create employee" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, id));
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.json(employee);
  } catch (err) {
    req.log.error(err, "Error fetching employee");
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: Record<string, unknown> = {};
    const allowed = ["name", "email", "role", "department", "status"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();
    const [employee] = await db.update(employeesTable).set(updates).where(eq(employeesTable.id, id)).returning();
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.json(employee);
  } catch (err) {
    req.log.error(err, "Error updating employee");
    res.status(500).json({ error: "Failed to update employee" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(employeesTable).where(eq(employeesTable.id, id));
    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    req.log.error(err, "Error deleting employee");
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

export default router;
