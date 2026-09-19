import { useListGoals, useLogGoalProgress, getListGoalsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Target, Trophy, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

export function GoalsPage() {
  const { data: goals, isLoading } = useListGoals();
  const logProgress = useLogGoalProgress();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [loggingId, setLoggingId] = useState<number | null>(null);
  const [progressAmount, setProgressAmount] = useState("");

  const handleLogProgress = (e: React.FormEvent, id: number) => {
    e.preventDefault();
    const amountNum = parseFloat(progressAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    logProgress.mutate(
      { id, data: { amount: amountNum } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
          setLoggingId(null);
          setProgressAmount("");
          toast({ title: "Goal progress updated" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium mb-4">
            <Target className="w-4 h-4" />
            <span>90-Day Goals</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Long-term vision.</h1>
          <p className="text-muted-foreground mt-1">Break big ambitions into daily steps.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : goals?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border/50 border-dashed">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No active goals</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Set a 90-day target to give your daily habits direction.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {goals?.map(goal => (
            <Card key={goal.id} className="rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow bg-card overflow-hidden flex flex-col">
              <CardHeader className="bg-muted/30 border-b border-border/50 px-6 py-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-2 block">{goal.area}</span>
                    <CardTitle className="text-xl font-bold leading-tight">{goal.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium bg-background px-2.5 py-1 rounded-full border border-border shrink-0">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Due {format(new Date(goal.dueDate), "MMM d")}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 flex-1 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-foreground font-mono">{goal.current} / {goal.target} {goal.unit}</span>
                    <span className="text-amber-600 font-bold">{goal.percentComplete.toFixed(0)}%</span>
                  </div>
                  <Progress value={goal.percentComplete} className="h-3 bg-muted [&>div]:bg-amber-500 rounded-full" />
                </div>

                <div className="mt-auto">
                  {loggingId === goal.id ? (
                    <form onSubmit={(e) => handleLogProgress(e, goal.id)} className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl border border-border">
                      <Input
                        type="number" step="0.1" min="0.1"
                        placeholder={`Add ${goal.unit}`}
                        value={progressAmount}
                        onChange={e => setProgressAmount(e.target.value)}
                        className="bg-background rounded-xl h-10 font-mono text-sm border-transparent focus-visible:bg-white"
                        autoFocus
                      />
                      <Button type="submit" size="sm" className="h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shrink-0 px-4">Log</Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setLoggingId(null)} className="h-10 rounded-xl shrink-0">Cancel</Button>
                    </form>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl h-12 font-medium hover:border-amber-500 hover:text-amber-600 transition-colors"
                      onClick={() => setLoggingId(goal.id)}
                      disabled={goal.percentComplete >= 100}
                    >
                      {goal.percentComplete >= 100 ? "Goal Completed 🎉" : "Log Progress"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
