import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { auditLogsTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/logs", async (req, res) => {
  try {
    const limit = parseInt((req.query.limit as string) || "50");
    const offset = parseInt((req.query.offset as string) || "0");
    const logs = await db.select().from(auditLogsTable)
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json(logs);
  } catch (err) {
    req.log.error(err, "Error fetching audit logs");
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
