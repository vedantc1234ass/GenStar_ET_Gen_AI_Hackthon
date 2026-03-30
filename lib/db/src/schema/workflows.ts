import { pgTable, serial, text, real, integer, pgEnum, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { employeesTable } from "./employees";

export const workflowStatusEnum = pgEnum("workflow_status", ["draft", "active", "running", "completed", "failed", "paused"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);

export const workflowsTable = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  status: workflowStatusEnum("status").notNull().default("draft"),
  priority: priorityEnum("priority").notNull().default("medium"),
  slaDeadline: timestamp("sla_deadline"),
  ownerId: integer("owner_id").references(() => employeesTable.id),
  taskCount: integer("task_count").notNull().default(0),
  completedTasks: integer("completed_tasks").notNull().default(0),
  riskScore: real("risk_score").notNull().default(0),
  bottlenecks: jsonb("bottlenecks").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertWorkflowSchema = createInsertSchema(workflowsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type Workflow = typeof workflowsTable.$inferSelect;
