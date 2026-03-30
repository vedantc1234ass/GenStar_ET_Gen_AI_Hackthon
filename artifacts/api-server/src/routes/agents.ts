import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { workflowsTable } from "@workspace/db/schema";

const router: IRouter = Router();

const AGENT_TYPES = [
  { type: "orchestrator", name: "Orchestrator Agent", descriptions: ["Breaking down goals into tasks", "Analyzing workflow dependencies", "Coordinating agent pipeline", "Idle — awaiting new workflow"] },
  { type: "decision", name: "Decision Agent", descriptions: ["Determining execution order", "Evaluating task priorities", "Resolving conflicts", "Idle"] },
  { type: "data", name: "Data Agent", descriptions: ["Fetching employee data", "Loading workflow policies", "Querying inventory", "Idle"] },
  { type: "action", name: "Action Agent", descriptions: ["Executing API calls", "Updating database records", "Sending notifications", "Idle"] },
  { type: "verification", name: "Verification Agent", descriptions: ["Confirming task success", "Validating data integrity", "Checking SLA compliance", "Idle"] },
  { type: "recovery", name: "Recovery Agent", descriptions: ["Retrying failed tasks", "Escalating critical issues", "Applying fallback strategy", "Idle"] },
  { type: "audit", name: "Audit Agent", descriptions: ["Logging agent decisions", "Recording action history", "Generating audit trail", "Idle"] },
  { type: "monitoring", name: "Monitoring Agent", descriptions: ["Tracking workflow health", "Predicting bottlenecks", "Sending SLA alerts", "Idle"] },
];

const agentStatuses = ["idle", "processing", "completed"] as const;

router.get("/activity", async (req, res) => {
  try {
    const workflows = await db.select().from(workflowsTable);
    const runningWorkflows = workflows.filter(w => w.status === "running");

    const activity = AGENT_TYPES.map((agent, idx) => {
      const isActive = runningWorkflows.length > 0 && idx < runningWorkflows.length + 2;
      const status = isActive
        ? (Math.random() > 0.3 ? "processing" : "completed")
        : "idle";
      const workflow = runningWorkflows[idx % Math.max(runningWorkflows.length, 1)];
      const descIdx = status === "idle" ? 3 : Math.floor(Math.random() * 3);

      return {
        agentId: `agent-${agent.type}-${idx + 1}`,
        agentName: agent.name,
        agentType: agent.type,
        status,
        currentTask: agent.descriptions[descIdx],
        workflowId: workflow?.id,
        workflowName: workflow?.name,
        startedAt: new Date(Date.now() - Math.random() * 300000).toISOString(),
        reasoning: status === "processing"
          ? `Analyzing ${workflow?.name || "current workflow"} using context-aware decision trees`
          : undefined,
      };
    });

    res.json(activity);
  } catch (err) {
    req.log.error(err, "Error fetching agent activity");
    res.status(500).json({ error: "Failed to fetch agent activity" });
  }
});

export default router;
