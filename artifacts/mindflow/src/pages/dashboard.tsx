import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Brain, DollarSign, Activity, Users, Target, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/react";

export function DashboardPage() {
  const { data: dashboard, isLoading, error } = useGetDashboard();
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl w-full" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-destructive font-medium">Failed to load your flow. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  const firstName = user?.firstName || dashboard.user.firstName || "there";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Good morning, {firstName}.
          </h1>
          <p className="text-muted-foreground text-lg">{dashboard.dateLabel} — Make today feel possible.</p>
        </div>
        {dashboard.dataMode === 'demo' && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium border border-secondary-border">
            <Info className="w-4 h-4" />
            <span>{dashboard.dataMessage}</span>
          </div>
        )}
      </div>

      {/* Main Flow Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 shadow-lg rounded-3xl overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <CardContent className="p-8 md:p-10 relative z-10 flex flex-col justify-between h-full min-h-[240px]">
            <div>
              <p className="text-primary-foreground/80 font-medium mb-1">Today's Flow</p>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-6xl font-bold tracking-tight">{dashboard.flowScore}</span>
                <span className="text-xl text-primary-foreground/70 mb-2">/ 100</span>
              </div>
              <Progress value={dashboard.flowScore} className="bg-primary-foreground/20 h-2 mb-2 [&>div]:bg-white" />
              <p className="text-sm text-primary-foreground/80 mt-3">{dashboard.completedToday} of {dashboard.totalToday} daily actions completed</p>
            </div>
          </CardContent>
        </Card>

        {/* Next Action */}
        <Card className="rounded-3xl border-border shadow-sm flex flex-col h-full bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> Next Action
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-2">{dashboard.nextAction.title}</h3>
            <p className="text-muted-foreground mb-6 line-clamp-2">{dashboard.nextAction.detail}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-sm font-medium bg-secondary text-secondary-foreground px-3 py-1 rounded-full">
                {dashboard.nextAction.dueLabel}
              </span>
              <Button size="sm" className="rounded-full" asChild>
                <Link href={`/${dashboard.nextAction.sourceType}`}>Go to {dashboard.nextAction.sourceType}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Habits */}
        <Link href="/habits">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group rounded-2xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Habits</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {dashboard.habits.filter(h => h.completed).length} / {dashboard.habits.length} done
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Money */}
        <Link href="/money">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-emerald-500/50 group rounded-2xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Money</h3>
              <p className="text-sm text-muted-foreground font-mono">
                ${dashboard.budget.remaining} left
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Health */}
        <Link href="/health">
          <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-rose-500/50 group rounded-2xl">
            <CardContent className="p-6">
              <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4 text-rose-600 group-hover:scale-110 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Health</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {dashboard.health.readiness}% readiness
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* Growth & Goals */}
        <div className="flex flex-col gap-4">
          <Link href="/growth" className="block flex-1">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-blue-500/50 group rounded-2xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">Growth</h3>
                  <p className="text-xs text-muted-foreground font-mono">+{dashboard.growth.weeklyGrowth} this week</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/goals" className="block flex-1">
            <Card className="h-full hover:shadow-md transition-all cursor-pointer hover:border-amber-500/50 group rounded-2xl">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-0.5">Goals</h3>
                  <p className="text-xs text-muted-foreground font-mono">{dashboard.goals.length} active</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Activity Log */}
      <Card className="rounded-3xl shadow-sm border-border overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50 px-6 py-4">
          <CardTitle className="text-base font-semibold">Recent Flow</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dashboard.activity.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No recent activity. Start building your flow!</div>
          ) : (
            <div className="divide-y divide-border">
              {dashboard.activity.slice(0, 5).map(act => (
                <div key={act.id} className="p-4 px-6 flex items-start gap-4 hover:bg-muted/10 transition-colors">
                  <div className="mt-0.5 text-muted-foreground shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{act.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{act.detail}</p>
                  </div>
                  <div className="shrink-0 text-xs font-mono text-muted-foreground">
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
