import { useGetHealthMetrics, useLogMovement, getGetHealthMetricsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Activity, Heart, Moon, Footprints, Flame, Timer, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export function HealthPage() {
  const { data: health, isLoading } = useGetHealthMetrics();
  const logMovement = useLogMovement();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isLogging, setIsLogging] = useState(false);
  const [minutes, setMinutes] = useState("");

  const handleLog = (e: React.FormEvent) => {
    e.preventDefault();
    const minNum = parseInt(minutes, 10);
    if (isNaN(minNum) || minNum <= 0) return;

    logMovement.mutate(
      { data: { minutes: minNum } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetHealthMetricsQueryKey() });
          setIsLogging(false);
          setMinutes("");
          toast({ title: `Logged ${minNum} minutes of movement` });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            <span>Health</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Health at a glance.</h1>
          <p className="text-muted-foreground mt-1">Listen to your body's signals daily.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl md:col-span-3" />
        </div>
      ) : health && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-3xl border-0 shadow-md bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-rose-100 font-medium text-sm uppercase tracking-wider mb-1">Readiness</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold tracking-tight">{health.readiness}</span>
                    <span className="text-lg text-rose-200 mb-1">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider mb-1">Sleep</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold tracking-tight">{health.sleepHours}</span>
                    <span className="text-base text-muted-foreground mb-1 font-mono">hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-border shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Footprints className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground font-medium text-sm uppercase tracking-wider mb-1">Steps</p>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-bold tracking-tight">{health.steps.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border-border shadow-sm">
            <CardHeader className="border-b border-border/50 px-6 py-5 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" /> Daily Movement
              </CardTitle>
              {!isLogging && (
                <Button onClick={() => setIsLogging(true)} variant="outline" size="sm" className="rounded-full">
                  <Plus className="w-4 h-4 mr-2" /> Log Time
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {isLogging ? (
                <form onSubmit={handleLog} className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/30 rounded-2xl border border-border mb-6">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 block">Minutes active</label>
                    <div className="relative">
                      <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number" min="1"
                        placeholder="e.g. 30"
                        value={minutes}
                        onChange={e => setMinutes(e.target.value)}
                        className="pl-9 bg-background rounded-xl font-mono"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex items-end gap-2 sm:w-64">
                    <Button type="button" variant="ghost" onClick={() => setIsLogging(false)} className="rounded-xl flex-1">Cancel</Button>
                    <Button type="submit" disabled={logMovement.isPending || !minutes} className="rounded-xl flex-1 bg-orange-500 hover:bg-orange-600 text-white">Save</Button>
                  </div>
                </form>
              ) : null}

              <div className="flex items-center justify-center p-8 flex-col text-center">
                <div className="w-32 h-32 rounded-full border-8 border-orange-500/20 flex flex-col items-center justify-center mb-6 relative">
                  <div
                    className="absolute inset-0 rounded-full border-8 border-orange-500"
                    style={{
                      clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%)`, // simple circle progress stand-in
                      opacity: health.movementMinutes > 0 ? 1 : 0.2
                    }}
                  />
                  <span className="text-4xl font-bold tracking-tight font-mono relative z-10">{health.movementMinutes}</span>
                  <span className="text-sm text-muted-foreground font-medium uppercase relative z-10">min</span>
                </div>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {health.movementMinutes >= 30
                    ? "Great job! You hit the daily recommended 30 minutes of activity."
                    : `You need ${30 - health.movementMinutes} more minutes of movement today to reach your goal.`}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
