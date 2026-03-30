import { pgTable, serial, text, integer, pgEnum, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { workflowsTable } from "./workflows";

export const meetingStatusEnum = pgEnum("meeting_status", ["processing", "processed", "failed"]);

export const meetingsTable = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  transcript: text("transcript").notNull(),
  date: timestamp("date").notNull(),
  decisions: jsonb("decisions").$type<string[]>().notNull().default([]),
  extractedTasks: jsonb("extracted_tasks").$type<Array<{title: string; owner: string; deadline: string; priority: string}>>().notNull().default([]),
  workflowId: integer("workflow_id").references(() => workflowsTable.id),
  status: meetingStatusEnum("status").notNull().default("processing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetingsTable).omit({ id: true, createdAt: true });
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetingsTable.$inferSelect;
