import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import {
  activitiesTable,
  calendarPreparationsTable,
  db,
  expensesTable,
  goalsTable,
  growthMetricsTable,
  habitsTable,
  healthMetricsTable,
  tasksTable,
  usersTable,
} from "@workspace/db";
import {
  CompleteHabitParams,
  CompleteHabitResponse,
  CreateExpenseBody,
  CreateExpenseResponse,
  CreateHabitBody,
  CreateHabitResponse,
  DeleteHabitParams,
  ExportCalendarIcsBody,
  ExportCalendarIcsResponse,
  GetBudgetResponse,
  GetDashboardResponse,
  GetGrowthResponse,
  GetHealthMetricsResponse,
  ListActivityResponse,
  ListExpensesResponse,
  ListGoalsResponse,
  ListHabitsResponse,
  LogGoalProgressBody,
  LogGoalProgressParams,
  LogGoalProgressResponse,
  LogMovementBody,
  LogMovementResponse,
  PrepareCalendarActionBody,
  PrepareCalendarActionResponse,
  RecordGrowthCheckinBody,
  RecordGrowthCheckinResponse,
  UpdateBudgetBody,
  UpdateBudgetResponse,
  UpdateHabitBody,
  UpdateHabitParams,
  UpdateHabitResponse,
} from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../middlewares/requireAuth";

const router: IRouter = Router();
router.use(requireAuth);

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (days: number) => {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
};

async function recordActivity(
  userId: string,
  kind: string,
  title: string,
  detail: string,
) {
  await db.insert(activitiesTable).values({ userId, kind, title, detail });
}

async function ensureSeeded(userId: string) {
  await db
    .insert(usersTable)
    .values({
      id: userId,
      firstName: "Alex",
      email: "",
      weeklyBudget: 500,
    })
    .onConflictDoNothing();

  const existingHabits = await db
    .select({ id: habitsTable.id })
    .from(habitsTable)
    .where(eq(habitsTable.userId, userId))
    .limit(1);

  if (existingHabits.length > 0) return;

  await db.insert(habitsTable).values([
    {
      userId,
      name: "Morning light + water",
      category: "Wellbeing",
      scheduledTime: "07:30",
      completed: true,
      streak: 12,
    },
    {
      userId,
      name: "20-minute focus block",
      category: "Focus",
      scheduledTime: "09:00",
      completed: false,
      streak: 7,
    },
    {
      userId,
      name: "No-spend lunch",
      category: "Money",
      scheduledTime: "12:30",
      completed: false,
      streak: 3,
    },
  ]);

  await db.insert(expensesTable).values([
    { userId, merchant: "Corner Market", category: "Groceries", amount: 42.8, spentAt: today() },
    { userId, merchant: "Metro Pass", category: "Transport", amount: 18, spentAt: inDays(-1) },
    { userId, merchant: "Field Notes", category: "Personal", amount: 12.5, spentAt: inDays(-2) },
  ]);

  await db.insert(healthMetricsTable).values({
    userId,
    steps: 6240,
    sleepHours: 7.4,
    readiness: 78,
    movementMinutes: 24,
  });

  await db.insert(growthMetricsTable).values({
    userId,
    audience: 12480,
    previousAudience: 12120,
    lastCheckIn: today(),
  });

  await db.insert(goalsTable).values({
    userId,
    title: "Build a three-month safety cushion",
    area: "Money",
    current: 4200,
    target: 9000,
    unit: "$",
    dueDate: inDays(90),
  });

  await db.insert(tasksTable).values({
    userId,
    title: "Review this week's spending",
    detail: "Ten quiet minutes to notice the pattern, not judge it.",
    sourceType: "money",
    dueDate: today(),
    scheduledTime: "17:30",
  });

  await db.insert(activitiesTable).values([
    {
      userId,
      kind: "habit",
      title: "Morning habit completed",
      detail: "Morning light + water · 12 day streak",
    },
    {
      userId,
      kind: "goal",
      title: "Goal progress saved",
      detail: "$4,200 of $9,000",
    },
  ]);
}

function habitResponse(habit: typeof habitsTable.$inferSelect) {
  return {
    id: habit.id,
    name: habit.name,
    category: habit.category,
    scheduledTime: habit.scheduledTime,
    completed: habit.completed,
    streak: habit.streak,
  };
}

function goalResponse(goal: typeof goalsTable.$inferSelect) {
  return {
    id: goal.id,
    title: goal.title,
    area: goal.area,
    current: goal.current,
    target: goal.target,
    unit: goal.unit,
    dueDate: goal.dueDate,
    percentComplete: Math.min(100, Math.round((goal.current / goal.target) * 100)),
  };
}

async function getBudgetData(userId: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const weekStart = new Date();
  weekStart.setUTCDate(weekStart.getUTCDate() - 6);
  const expenses = await db
    .select()
    .from(expensesTable)
    .where(
      and(
        eq(expensesTable.userId, userId),
        gte(expensesTable.spentAt, weekStart.toISOString().slice(0, 10)),
      ),
    );
  const weeklyLimit = user?.weeklyBudget ?? 500;
  const spent = Number(expenses.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  return {
    weeklyLimit,
    spent,
    remaining: Number(Math.max(0, weeklyLimit - spent).toFixed(2)),
    percentUsed: Math.min(100, Math.round((spent / weeklyLimit) * 100)),
  };
}

async function getHealthData(userId: string) {
  const [metrics] = await db
    .select()
    .from(healthMetricsTable)
    .where(eq(healthMetricsTable.userId, userId))
    .limit(1);
  return {
    steps: metrics?.steps ?? 0,
    sleepHours: metrics?.sleepHours ?? 0,
    readiness: metrics?.readiness ?? 0,
    movementMinutes: metrics?.movementMinutes ?? 0,
  };
}

async function getGrowthData(userId: string) {
  const [growth] = await db
    .select()
    .from(growthMetricsTable)
    .where(eq(growthMetricsTable.userId, userId))
    .limit(1);
  const audience = growth?.audience ?? 0;
  const previous = growth?.previousAudience ?? audience;
  const weeklyGrowth = audience - previous;
  return {
    audience,
    weeklyGrowth,
    growthPercent: previous > 0 ? Number(((weeklyGrowth / previous) * 100).toFixed(1)) : 0,
    lastCheckIn: growth?.lastCheckIn ?? null,
  };
}

router.get("/dashboard", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);

  const [userRows, habitRows, goalRows, activityRows, budget, health, growth] =
    await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1),
      db.select().from(habitsTable).where(eq(habitsTable.userId, userId)).orderBy(asc(habitsTable.scheduledTime)),
      db.select().from(goalsTable).where(eq(goalsTable.userId, userId)).orderBy(asc(goalsTable.dueDate)),
      db.select().from(activitiesTable).where(eq(activitiesTable.userId, userId)).orderBy(desc(activitiesTable.createdAt)).limit(8),
      getBudgetData(userId),
      getHealthData(userId),
      getGrowthData(userId),
    ]);

  const user = userRows[0]!;
  const completedToday = habitRows.filter((habit) => habit.completed).length;
  const goalProgress = goalRows.length
    ? goalRows.reduce((sum, goal) => sum + Math.min(1, goal.current / goal.target), 0) / goalRows.length
    : 0;
  const habitProgress = habitRows.length ? completedToday / habitRows.length : 0;
  const flowScore = Math.round((habitProgress * 0.7 + goalProgress * 0.3) * 100);
  const nextHabit = habitRows.find((habit) => !habit.completed);

  const result = {
    user: {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      imageUrl: user.imageUrl,
    },
    dateLabel: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(new Date()),
    flowScore,
    completedToday,
    totalToday: habitRows.length,
    nextAction: nextHabit
      ? {
          title: nextHabit.name,
          detail: `${nextHabit.category} · ${nextHabit.streak} day rhythm`,
          sourceType: "habit",
          sourceId: nextHabit.id,
          dueLabel: `Today at ${nextHabit.scheduledTime}`,
        }
      : {
          title: "Protect the progress you made",
          detail: "Your daily habits are complete. Leave a little room for rest.",
          sourceType: "reflection",
          sourceId: null,
          dueLabel: "Whenever it feels right",
        },
    habits: habitRows.map(habitResponse),
    budget,
    health,
    growth,
    goals: goalRows.map(goalResponse),
    activity: activityRows.map((item) => ({
      id: item.id,
      kind: item.kind,
      title: item.title,
      detail: item.detail,
      createdAt: item.createdAt.toISOString(),
    })),
    dataMode: "demo" as const,
    dataMessage:
      "This workspace uses account-based demo data. Nothing is connected or shared without your permission.",
  };

  res.json(GetDashboardResponse.parse(result));
});

router.get("/activity", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  const rows = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.userId, userId))
    .orderBy(desc(activitiesTable.createdAt))
    .limit(20);
  res.json(
    ListActivityResponse.parse(
      rows.map((item) => ({ ...item, createdAt: item.createdAt.toISOString() })),
    ),
  );
});

router.get("/habits", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  const rows = await db
    .select()
    .from(habitsTable)
    .where(eq(habitsTable.userId, userId))
    .orderBy(asc(habitsTable.scheduledTime));
  res.json(ListHabitsResponse.parse(rows.map(habitResponse)));
});

router.post("/habits", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = CreateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [habit] = await db
    .insert(habitsTable)
    .values({ userId, ...parsed.data })
    .returning();
  await recordActivity(userId, "habit", "Habit added", habit.name);
  res.status(201).json(CreateHabitResponse.parse(habitResponse(habit)));
});

router.patch("/habits/:id", async (req, res): Promise<void> => {
  const { userId } = req as unknown as AuthedRequest;
  const params = UpdateHabitParams.safeParse(req.params);
  const body = UpdateHabitBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid habit update" });
    return;
  }
  const [habit] = await db
    .update(habitsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(and(eq(habitsTable.id, params.data.id), eq(habitsTable.userId, userId)))
    .returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.json(UpdateHabitResponse.parse(habitResponse(habit)));
});

router.delete("/habits/:id", async (req, res): Promise<void> => {
  const { userId } = req as unknown as AuthedRequest;
  const params = DeleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [habit] = await db
    .delete(habitsTable)
    .where(and(eq(habitsTable.id, params.data.id), eq(habitsTable.userId, userId)))
    .returning();
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  await recordActivity(userId, "habit", "Habit removed", habit.name);
  res.sendStatus(204);
});

router.post("/habits/:id/complete", async (req, res): Promise<void> => {
  const { userId } = req as unknown as AuthedRequest;
  const params = CompleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [current] = await db
    .select()
    .from(habitsTable)
    .where(and(eq(habitsTable.id, params.data.id), eq(habitsTable.userId, userId)))
    .limit(1);
  if (!current) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const completed = !current.completed;
  const [habit] = await db
    .update(habitsTable)
    .set({
      completed,
      streak: Math.max(0, current.streak + (completed ? 1 : -1)),
      updatedAt: new Date(),
    })
    .where(eq(habitsTable.id, current.id))
    .returning();
  await recordActivity(
    userId,
    "habit",
    completed ? "Habit completed" : "Habit reopened",
    habit.name,
  );
  res.json(CompleteHabitResponse.parse(habitResponse(habit)));
});

router.get("/expenses", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  const rows = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.userId, userId))
    .orderBy(desc(expensesTable.spentAt), desc(expensesTable.createdAt))
    .limit(50);
  res.json(ListExpensesResponse.parse(rows));
});

router.post("/expenses", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [expense] = await db
    .insert(expensesTable)
    .values({
      userId,
      ...parsed.data,
      spentAt:
        parsed.data.spentAt instanceof Date
          ? parsed.data.spentAt.toISOString().slice(0, 10)
          : parsed.data.spentAt,
    })
    .returning();
  await recordActivity(
    userId,
    "money",
    "Expense saved",
    `${expense.merchant} · $${expense.amount.toFixed(2)}`,
  );
  res.status(201).json(CreateExpenseResponse.parse(expense));
});

router.get("/budget", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  res.json(GetBudgetResponse.parse(await getBudgetData(userId)));
});

router.patch("/budget", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .update(usersTable)
    .set({ weeklyBudget: parsed.data.weeklyLimit, updatedAt: new Date() })
    .where(eq(usersTable.id, userId));
  await recordActivity(userId, "money", "Weekly budget updated", `$${parsed.data.weeklyLimit}`);
  res.json(UpdateBudgetResponse.parse(await getBudgetData(userId)));
});

router.get("/health", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  res.json(GetHealthMetricsResponse.parse(await getHealthData(userId)));
});

router.post("/health/movement", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = LogMovementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = await getHealthData(userId);
  await db
    .update(healthMetricsTable)
    .set({
      movementMinutes: current.movementMinutes + parsed.data.minutes,
      steps: current.steps + parsed.data.minutes * 90,
      updatedAt: new Date(),
    })
    .where(eq(healthMetricsTable.userId, userId));
  await recordActivity(userId, "health", "Movement logged", `${parsed.data.minutes} minutes`);
  res.json(LogMovementResponse.parse(await getHealthData(userId)));
});

router.get("/growth", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  res.json(GetGrowthResponse.parse(await getGrowthData(userId)));
});

router.post("/growth/checkin", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = RecordGrowthCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const current = await getGrowthData(userId);
  await db
    .update(growthMetricsTable)
    .set({
      previousAudience: current.audience,
      audience: parsed.data.audience,
      lastCheckIn: today(),
      updatedAt: new Date(),
    })
    .where(eq(growthMetricsTable.userId, userId));
  await recordActivity(
    userId,
    "growth",
    "Growth check-in saved",
    `${parsed.data.audience.toLocaleString()} audience`,
  );
  res.json(RecordGrowthCheckinResponse.parse(await getGrowthData(userId)));
});

router.get("/goals", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  await ensureSeeded(userId);
  const rows = await db
    .select()
    .from(goalsTable)
    .where(eq(goalsTable.userId, userId))
    .orderBy(asc(goalsTable.dueDate));
  res.json(ListGoalsResponse.parse(rows.map(goalResponse)));
});

router.post("/goals/:id/progress", async (req, res): Promise<void> => {
  const { userId } = req as unknown as AuthedRequest;
  const params = LogGoalProgressParams.safeParse(req.params);
  const body = LogGoalProgressBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid goal progress" });
    return;
  }
  const [goal] = await db
    .update(goalsTable)
    .set({ current: body.data.amount, updatedAt: new Date() })
    .where(and(eq(goalsTable.id, params.data.id), eq(goalsTable.userId, userId)))
    .returning();
  if (!goal) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  await recordActivity(
    userId,
    "goal",
    "Goal progress saved",
    `${goal.unit}${goal.current.toLocaleString()} of ${goal.unit}${goal.target.toLocaleString()}`,
  );
  res.json(LogGoalProgressResponse.parse(goalResponse(goal)));
});

function calendarResult(data: {
  title: string;
  detail: string;
  date: string | Date;
  startTime: string;
  durationMinutes: number;
}) {
  const calendarDate =
    data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
  const start = new Date(`${calendarDate}T${data.startTime}:00`);
  const end = new Date(start.getTime() + data.durationMinutes * 60_000);
  const dates = `${start.toISOString().replace(/[-:]/g, "").replace(".000", "")}/${end
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(".000", "")}`;
  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: data.title,
    details: data.detail,
    dates,
  });
  return {
    title: data.title,
    detail: data.detail,
    start,
    end,
    googleCalendarUrl: `https://calendar.google.com/calendar/render?${search.toString()}`,
  };
}

router.post("/calendar/prepare", async (req, res): Promise<void> => {
  const { userId } = req as AuthedRequest;
  const parsed = PrepareCalendarActionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const prepared = calendarResult(parsed.data);
  await db.insert(calendarPreparationsTable).values({
    userId,
    title: prepared.title,
    detail: prepared.detail,
    startAt: prepared.start,
    endAt: prepared.end,
  });
  await recordActivity(userId, "calendar", "Calendar action prepared", prepared.title);
  res.json(
    PrepareCalendarActionResponse.parse({
      title: prepared.title,
      detail: prepared.detail,
      startIso: prepared.start.toISOString(),
      endIso: prepared.end.toISOString(),
      googleCalendarUrl: prepared.googleCalendarUrl,
      status: "prepared",
      disclaimer:
        "Prepared for your review. This is not a live calendar sync and no calendar is connected.",
    }),
  );
});

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsTimestamp(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(".000", "");
}

router.post("/calendar/ics", async (req, res): Promise<void> => {
  const parsed = ExportCalendarIcsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const prepared = calendarResult(parsed.data);
  const slug = prepared.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const uid = `${Date.now()}-${slug}@mindflow.local`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MindFlow//Calendar Export//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(prepared.start)}`,
    `DTEND:${icsTimestamp(prepared.end)}`,
    `SUMMARY:${escapeIcs(prepared.title)}`,
    `DESCRIPTION:${escapeIcs(prepared.detail)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  res.json(
    ExportCalendarIcsResponse.parse({
      filename: `${slug || "mindflow-action"}.ics`,
      content,
      disclaimer:
        "This file is a one-time export. Downloading it does not create a live calendar connection.",
    }),
  );
});

export default router;
