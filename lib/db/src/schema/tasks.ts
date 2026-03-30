import { pgTable, serial, text, real, integer, pgEnum, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workflowsTable } from "./workflows";
import { employeesTable } from "./employees";

export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "failed", "blocked", "escalated"]);

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").references(() => workflowsTable.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  assigneeId: integer("assignee_id").references(() => employeesTable.id),
  agentType: text("agent_type"),
  dependencies: jsonb("dependencies").$type<number[]>().notNull().default([]),
  deadline: timestamp("deadline"),
  completedAt: timestamp("completed_at"),
  riskScore: real("risk_score").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;
