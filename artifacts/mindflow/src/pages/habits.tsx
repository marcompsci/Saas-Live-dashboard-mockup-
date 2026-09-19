import { useListHabits, useCreateHabit, useCompleteHabit, useDeleteHabit, getListHabitsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, CheckCircle2, Circle, Flame, Plus, Trash2, PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export function HabitsPage() {
  const { data: habits, isLoading } = useListHabits();
  const createHabit = useCreateHabit();
  const completeHabit = useCompleteHabit();
  const deleteHabit = useDeleteHabit();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", category: "morning", scheduledTime: "08:00" });

  const handleComplete = (id: number, currentStatus: boolean) => {
    // Optimistic update
    queryClient.setQueryData(getListHabitsQueryKey(), (old: any) => {
      if (!old) return old;
      return old.map((h: any) => h.id === id ? { ...h, completed: !currentStatus, streak: currentStatus ? h.streak - 1 : h.streak + 1 } : h);
    });

    completeHabit.mutate(
      { id },
      {
        onError: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          toast({ title: "Failed to update habit", variant: "destructive" });
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
        }
      }
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name) return;

    createHabit.mutate(
      { data: newHabit },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          setIsCreating(false);
          setNewHabit({ name: "", category: "morning", scheduledTime: "08:00" });
          toast({ title: "Habit created" });
        },
        onError: () => {
          toast({ title: "Failed to create habit", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    deleteHabit.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
          toast({ title: "Habit deleted" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Brain className="w-4 h-4" />
            <span>Habits</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Build momentum quietly.</h1>
          <p className="text-muted-foreground mt-1">Track what matters without the guilt.</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="rounded-full shadow-sm" size="sm">
            <Plus className="w-4 h-4 mr-2" /> New Habit
          </Button>
        )}
      </div>

      {isCreating && (
        <Card className="border-primary/20 bg-card rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-medium text-foreground">What do you want to build?</label>
                <Input
                  placeholder="e.g. Read 10 pages"
                  value={newHabit.name}
                  onChange={e => setNewHabit({ ...newHabit, name: e.target.value })}
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:bg-white"
                  autoFocus
                />
              </div>
              <div className="w-full sm:w-32 space-y-2">
                <label className="text-sm font-medium text-foreground">Time</label>
                <Input
                  type="time"
                  value={newHabit.scheduledTime}
                  onChange={e => setNewHabit({ ...newHabit, scheduledTime: e.target.value })}
                  className="rounded-xl bg-muted/50 border-transparent focus-visible:bg-white"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="rounded-xl flex-1">Cancel</Button>
                <Button type="submit" disabled={createHabit.isPending || !newHabit.name} className="rounded-xl flex-1">Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : habits?.length === 0 ? (
        <div className="text-center py-20 bg-muted/30 rounded-3xl border border-border/50 border-dashed">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start small. Add one simple thing you want to do today.</p>
          <Button onClick={() => setIsCreating(true)} className="rounded-full">Add your first habit</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {habits?.map(habit => (
            <Card
              key={habit.id}
              className={cn(
                "rounded-2xl transition-all duration-200 border border-border group overflow-hidden",
                habit.completed ? "bg-muted/30 border-muted" : "bg-card shadow-sm hover:shadow-md hover:border-primary/30"
              )}
            >
              <div className="flex items-center p-4 sm:p-5 gap-4">
                <button
                  onClick={() => handleComplete(habit.id, habit.completed)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    habit.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                  data-testid={`btn-complete-${habit.id}`}
                >
                  {habit.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={cn("font-semibold text-lg truncate transition-colors", habit.completed && "text-muted-foreground line-through decoration-muted-foreground/30")}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm font-mono text-muted-foreground flex items-center gap-1">
                      {habit.scheduledTime}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                      <Flame className="w-3 h-3" />
                      {habit.streak} day streak
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(habit.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
