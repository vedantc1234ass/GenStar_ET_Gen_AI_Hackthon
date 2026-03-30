import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workflowsTable, tasksTable, employeesTable } from "@workspace/db/schema";

const router: IRouter = Router();

function generateResponse(message: string, context: { workflows: number; tasks: number; employees: number; completedTasks: number }): string {
  const lower = message.toLowerCase();

  if (lower.includes("workflow") && (lower.includes("how many") || lower.includes("count") || lower.includes("total"))) {
    return `You currently have **${context.workflows} workflows** in the system. ${context.workflows > 0 ? "They span various priorities and statuses." : "Create your first workflow in the Workflow Manager."}`;
  }
  if (lower.includes("task") && (lower.includes("how many") || lower.includes("count"))) {
    return `There are **${context.tasks} total tasks** across all workflows. **${context.completedTasks}** have been completed (${context.tasks > 0 ? Math.round((context.completedTasks / context.tasks) * 100) : 0}% completion rate).`;
  }
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("team")) {
    return `The system is tracking **${context.employees} employees**. You can view their productivity scores, task completion rates, and error metrics in the Employee Tracker module.`;
  }
  if (lower.includes("productivity") || lower.includes("performance")) {
    return `Employee productivity is calculated using the formula:\n\n**Productivity = (Tasks Completed × Quality Score) / Time Taken**\n\nYou can view detailed productivity analytics in the Analytics section, including department-level breakdowns and weekly trends.`;
  }
  if (lower.includes("agent") || lower.includes("pipeline")) {
    return `GenStar uses an **8-agent pipeline**:\n\n1. **Orchestrator** — Breaks goals into tasks\n2. **Decision** — Determines execution order\n3. **Data** — Fetches information\n4. **Action** — Executes via APIs\n5. **Verification** — Confirms success\n6. **Recovery** — Handles failures\n7. **Audit** — Logs everything\n8. **Monitoring** — Tracks health & SLA`;
  }
  if (lower.includes("meeting") || lower.includes("transcript")) {
    return `The **Meeting Intelligence** module can extract:\n- Key decisions made\n- Action items with owners\n- Deadlines\n- Priority levels\n\nIt automatically creates workflows and assigns tasks. Go to Meeting Intelligence to upload a transcript.`;
  }
  if (lower.includes("sla") || lower.includes("deadline") || lower.includes("violation")) {
    return `SLA violations occur when workflow deadlines are missed. The **Monitoring Agent** tracks SLA compliance in real-time and sends alerts. You can see current SLA risks on the Dashboard's Risk Alerts panel.`;
  }
  if (lower.includes("risk") || lower.includes("bottleneck")) {
    return `Risk scores are calculated based on:\n- Task complexity and dependencies\n- SLA proximity\n- Employee availability\n- Historical failure rates\n\nWorkflows with risk scores above 60 appear in the Risk Alerts panel with recommended mitigations.`;
  }
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("help")) {
    return `Hello! I'm **GenStar AI Assistant**, powered by enterprise intelligence. I can help you with:\n\n- Workflow status and analytics\n- Task management guidance\n- Employee productivity insights\n- Agent pipeline information\n- Meeting intelligence\n- SLA and risk monitoring\n\nWhat would you like to know?`;
  }
  if (lower.includes("audit") || lower.includes("log")) {
    return `The **Audit Agent** logs every action, decision, and reasoning in structured JSON format. You can view complete audit trails in the Audit Logs section. Logs include agent type, action taken, entity affected, and the AI reasoning behind each decision.`;
  }
  if (lower.includes("create") && lower.includes("workflow")) {
    return `To create a new workflow:\n1. Go to **Workflow Manager**\n2. Click **"Start Workflow"**\n3. Add workflow name, description, and priority\n4. Add tasks with owners and dependencies\n5. Click **"Execute Workflow"** to launch the agent pipeline\n\nThe Orchestrator Agent will automatically break down the goals and coordinate execution.`;
  }

  return `I understand you're asking about "${message}". GenStar's AI system manages workflows, tasks, employees, and meetings with an intelligent 8-agent pipeline. Could you be more specific? I can help with:\n- Workflow and task analytics\n- Employee productivity data\n- SLA monitoring\n- Agent pipeline status\n- Meeting intelligence extraction`;
}

router.post("/message", async (req, res) => {
  try {
    const { message, context: ctxHint } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const [workflows, tasks, employees] = await Promise.all([
      db.select().from(workflowsTable),
      db.select().from(tasksTable),
      db.select().from(employeesTable),
    ]);

    const context = {
      workflows: workflows.length,
      tasks: tasks.length,
      employees: employees.length,
      completedTasks: tasks.filter(t => t.status === "completed").length,
    };

    const response = generateResponse(message, context);

    res.json({
      response,
      sources: ["GenStar Workflow DB", "Analytics Engine", "Agent Memory System"],
    });
  } catch (err) {
    req.log.error(err, "Error in chatbot");
    res.status(500).json({ error: "Chatbot error" });
  }
});

export default router;
