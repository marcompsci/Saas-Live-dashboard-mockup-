import {
  boolean,
  date,
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("mindflow_users", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull().default("Friend"),
  email: text("email").notNull().default(""),
  imageUrl: text("image_url"),
  weeklyBudget: real("weekly_budget").notNull().default(500),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasksTable = pgTable("mindflow_tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  sourceType: text("source_type").notNull().default("manual"),
  sourceId: integer("source_id"),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  scheduledTime: text("scheduled_time").notNull().default("09:00"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const habitsTable = pgTable("mindflow_habits", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  completed: boolean("completed").notNull().default(false),
  streak: integer("streak").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const expensesTable = pgTable("mindflow_expenses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  spentAt: date("spent_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const healthMetricsTable = pgTable("mindflow_health_metrics", {
  userId: text("user_id").primaryKey(),
  steps: integer("steps").notNull().default(0),
  sleepHours: real("sleep_hours").notNull().default(0),
  readiness: integer("readiness").notNull().default(0),
  movementMinutes: integer("movement_minutes").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const growthMetricsTable = pgTable("mindflow_growth_metrics", {
  userId: text("user_id").primaryKey(),
  audience: integer("audience").notNull().default(0),
  previousAudience: integer("previous_audience").notNull().default(0),
  lastCheckIn: date("last_check_in", { mode: "string" }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const goalsTable = pgTable("mindflow_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  area: text("area").notNull(),
  current: real("current").notNull().default(0),
  target: real("target").notNull(),
  unit: text("unit").notNull(),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activitiesTable = pgTable("mindflow_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarPreparationsTable = pgTable("mindflow_calendar_preparations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("prepared"),
  externalEventId: text("external_event_id"),
  syncStatus: text("sync_status").notNull().default("not_connected"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
