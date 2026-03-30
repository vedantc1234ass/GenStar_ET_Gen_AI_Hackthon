import { pgTable, serial, text, real, integer, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const employeeStatusEnum = pgEnum("employee_status", ["active", "inactive", "on_leave"]);

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  status: employeeStatusEnum("status").notNull().default("active"),
  productivityScore: real("productivity_score").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
  tasksInProgress: integer("tasks_in_progress").notNull().default(0),
  errorRate: real("error_rate").notNull().default(0),
  idleTime: real("idle_time").notNull().default(0),
  qualityScore: real("quality_score").notNull().default(100),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
