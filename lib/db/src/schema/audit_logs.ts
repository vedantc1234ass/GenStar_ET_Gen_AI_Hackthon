import { pgTable, serial, text, integer, pgEnum, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const auditStatusEnum = pgEnum("audit_status", ["success", "failure", "warning"]);

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  agentType: text("agent_type").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id"),
  details: jsonb("details").$type<Record<string, unknown>>().default({}),
  reasoning: text("reasoning"),
  status: auditStatusEnum("status").notNull().default("success"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAuditLogSchema = createInsertSchema(auditLogsTable).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogsTable.$inferSelect;
