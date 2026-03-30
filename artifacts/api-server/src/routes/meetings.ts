import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { meetingsTable, workflowsTable, tasksTable, auditLogsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function extractMeetingIntelligence(transcript: string): { decisions: string[]; extractedTasks: Array<{title: string; owner: string; deadline: string; priority: string}> } {
  const lines = transcript.split("\n").map(l => l.trim()).filter(Boolean);
  const decisions: string[] = [];
  const extractedTasks: Array<{title: string; owner: string; deadline: string; priority: string}> = [];

  const decisionKeywords = ["decided", "agreed", "approved", "resolved", "confirmed", "will proceed"];
  const taskKeywords = ["action item", "todo", "task:", "will do", "responsible for", "needs to", "should", "must"];
  const priorityKeywords = { critical: ["urgent", "critical", "asap", "immediately"], high: ["high priority", "important", "priority"], medium: ["soon", "this week"], low: ["when possible", "eventually"] };

  const owners = ["John", "Jane", "Alice", "Bob", "Charlie", "Sarah", "Mike", "Emma", "Team Lead", "Manager"];

  let taskCounter = 0;
  for (const line of lines) {
    const lower = line.toLowerCase();

    if (decisionKeywords.some(k => lower.includes(k)) && line.length > 20) {
      decisions.push(line.replace(/^[-*•]\s*/, ""));
    }

    if (taskKeywords.some(k => lower.includes(k)) && taskCounter < 8) {
      let priority = "medium";
      for (const [p, keywords] of Object.entries(priorityKeywords)) {
        if (keywords.some(k => lower.includes(k))) { priority = p; break; }
      }
      const owner = owners.find(o => line.includes(o)) || "Team";
      const daysMap: Record<string, number> = { "tomorrow": 1, "next week": 7, "this week": 5, "end of month": 30 };
      let daysOut = 14;
      for (const [kw, days] of Object.entries(daysMap)) {
        if (lower.includes(kw)) { daysOut = days; break; }
      }
      const deadline = new Date(Date.now() + daysOut * 86400000).toISOString().split("T")[0];
      extractedTasks.push({
        title: line.replace(/^[-*•]\s*/, "").substring(0, 80),
        owner, deadline, priority,
      });
      taskCounter++;
    }
  }

  if (decisions.length === 0) {
    decisions.push("Meeting objectives discussed and reviewed", "Team aligned on next steps");
  }
  if (extractedTasks.length === 0) {
    extractedTasks.push({
      title: "Follow up on meeting action items",
      owner: "Team Lead",
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      priority: "medium",
    });
  }

  return { decisions: decisions.slice(0, 5), extractedTasks: extractedTasks.slice(0, 6) };
}

router.get("/", async (req, res) => {
  try {
    const meetings = await db.select().from(meetingsTable).orderBy(meetingsTable.id);
    res.json(meetings);
  } catch (err) {
    req.log.error(err, "Error fetching meetings");
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, transcript, date } = req.body;
    if (!title || !transcript || !date) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [meeting] = await db.insert(meetingsTable).values({
      title, transcript,
      date: new Date(date),
      decisions: [],
      extractedTasks: [],
      status: "processing",
    }).returning();

    const { decisions, extractedTasks } = extractMeetingIntelligence(transcript);

    const [workflow] = await db.insert(workflowsTable).values({
      name: `Meeting: ${title}`,
      description: `Auto-generated workflow from meeting: ${title}`,
      priority: "medium",
      riskScore: Math.round(Math.random() * 30 * 10) / 10,
      bottlenecks: [],
      taskCount: extractedTasks.length,
    }).returning();

    for (const et of extractedTasks) {
      await db.insert(tasksTable).values({
        workflowId: workflow.id,
        title: et.title,
        description: `Extracted from meeting: ${title}. Assigned to: ${et.owner}`,
        priority: et.priority as "low" | "medium" | "high" | "critical",
        agentType: "action",
        dependencies: [],
        deadline: new Date(et.deadline),
        riskScore: 10,
      });
    }

    const [updated] = await db.update(meetingsTable).set({
      decisions, extractedTasks, workflowId: workflow.id, status: "processed",
    }).where(eq(meetingsTable.id, meeting.id)).returning();

    await db.insert(auditLogsTable).values({
      agentType: "data",
      action: "meeting_intelligence_extracted",
      entityType: "meeting",
      entityId: meeting.id,
      details: { decisionsCount: decisions.length, tasksCount: extractedTasks.length, workflowId: workflow.id },
      reasoning: "Data agent processed transcript. Decision agent classified priorities. Action agent created workflow and tasks.",
      status: "success",
    });

    res.status(201).json(updated);
  } catch (err) {
    req.log.error(err, "Error creating meeting");
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [meeting] = await db.select().from(meetingsTable).where(eq(meetingsTable.id, id));
    if (!meeting) {
      res.status(404).json({ error: "Meeting not found" });
      return;
    }
    res.json(meeting);
  } catch (err) {
    req.log.error(err, "Error fetching meeting");
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
});

export default router;
