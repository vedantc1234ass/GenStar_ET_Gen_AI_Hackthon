import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workflowsTable, tasksTable, employeesTable, auditLogsTable } from "@workspace/db/schema";

const router: IRouter = Router();

router.get("/dashboard", async (req, res) => {
  try {
    const workflows = await db.select().from(workflowsTable);
    const tasks = await db.select().from(tasksTable);
    const employees = await db.select().from(employeesTable);

    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.status === "active" || w.status === "running").length;
    const completedWorkflows = workflows.filter(w => w.status === "completed").length;
    const failedWorkflows = workflows.filter(w => w.status === "failed").length;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const pendingTasks = tasks.filter(t => t.status === "pending").length;

    const now = new Date();
    const slaViolations = workflows.filter(w => w.slaDeadline && new Date(w.slaDeadline) < now && w.status !== "completed").length;

    const avgProductivityScore = employees.length > 0
      ? employees.reduce((sum, e) => sum + e.productivityScore, 0) / employees.length
      : 0;

    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const workflowDelayRate = totalWorkflows > 0 ? (slaViolations / totalWorkflows) * 100 : 0;
    const bottleneckCount = workflows.reduce((sum, w) => sum + (w.bottlenecks?.length || 0), 0);

    const tasksByStatus = [
      { name: "Completed", value: completedTasks, color: "#22c55e" },
      { name: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, color: "#3b82f6" },
      { name: "Pending", value: pendingTasks, color: "#f59e0b" },
      { name: "Failed", value: tasks.filter(t => t.status === "failed").length, color: "#ef4444" },
      { name: "Blocked", value: tasks.filter(t => t.status === "blocked").length, color: "#8b5cf6" },
      { name: "Escalated", value: tasks.filter(t => t.status === "escalated").length, color: "#f97316" },
    ].filter(d => d.value > 0);

    const workflowsByPriority = [
      { name: "Critical", value: workflows.filter(w => w.priority === "critical").length, color: "#ef4444" },
      { name: "High", value: workflows.filter(w => w.priority === "high").length, color: "#f59e0b" },
      { name: "Medium", value: workflows.filter(w => w.priority === "medium").length, color: "#3b82f6" },
      { name: "Low", value: workflows.filter(w => w.priority === "low").length, color: "#22c55e" },
    ].filter(d => d.value > 0);

    const taskCompletionTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.round(completedTasks * (0.5 + i * 0.07) + Math.random() * 5),
        label: "Tasks Completed",
      };
    });

    const employeeProductivity = employees.slice(0, 8).map(e => ({
      name: e.name.split(" ")[0],
      score: e.productivityScore,
      tasksCompleted: e.tasksCompleted,
    }));

    const riskAlerts = [
      ...workflows.filter(w => w.riskScore > 60).slice(0, 3).map((w, i) => ({
        id: i + 1,
        type: "sla_risk" as const,
        severity: w.riskScore > 80 ? "critical" as const : "high" as const,
        message: `Workflow "${w.name}" has high risk score: ${w.riskScore}`,
        entityId: w.id,
        entityType: "workflow",
        createdAt: new Date().toISOString(),
      })),
      ...tasks.filter(t => t.status === "escalated").slice(0, 2).map((t, i) => ({
        id: i + 10,
        type: "bottleneck" as const,
        severity: "high" as const,
        message: `Task "${t.title}" has been escalated`,
        entityId: t.id,
        entityType: "task",
        createdAt: new Date().toISOString(),
      })),
    ];

    res.json({
      totalWorkflows, activeWorkflows, completedWorkflows, failedWorkflows,
      totalTasks, completedTasks, pendingTasks, slaViolations,
      avgProductivityScore: Math.round(avgProductivityScore * 10) / 10,
      taskCompletionRate: Math.round(taskCompletionRate * 10) / 10,
      workflowDelayRate: Math.round(workflowDelayRate * 10) / 10,
      bottleneckCount,
      tasksByStatus,
      workflowsByPriority,
      taskCompletionTrend,
      employeeProductivity,
      riskAlerts,
    });
  } catch (err) {
    req.log.error(err, "Error fetching dashboard analytics");
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

router.get("/productivity", async (req, res) => {
  try {
    const employees = await db.select().from(employeesTable);

    const empDetails = employees.map(e => ({
      id: e.id,
      name: e.name,
      department: e.department,
      productivityScore: e.productivityScore,
      tasksCompleted: e.tasksCompleted,
      errorRate: e.errorRate,
      idleTime: e.idleTime,
      qualityScore: e.qualityScore,
      weeklyTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", { weekday: "short" }),
        value: Math.max(0, Math.min(100, e.productivityScore + (Math.random() - 0.5) * 20)),
        label: "Productivity",
      })),
    }));

    const departments = [...new Set(employees.map(e => e.department))];
    const departmentMetrics = departments.map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      return {
        department: dept,
        avgProductivity: Math.round(deptEmps.reduce((s, e) => s + e.productivityScore, 0) / deptEmps.length * 10) / 10,
        headcount: deptEmps.length,
        tasksCompleted: deptEmps.reduce((s, e) => s + e.tasksCompleted, 0),
      };
    });

    const weeklyTrend = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString("en-US", { weekday: "short" }),
      value: Math.round(65 + i * 2.5 + (Math.random() - 0.5) * 10),
      label: "Avg Productivity",
    }));

    res.json({ employees: empDetails, departmentMetrics, weeklyTrend });
  } catch (err) {
    req.log.error(err, "Error fetching productivity analytics");
    res.status(500).json({ error: "Failed to fetch productivity" });
  }
});

export default router;
