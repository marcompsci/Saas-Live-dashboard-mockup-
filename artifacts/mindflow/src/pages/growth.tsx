import { useGetGrowth, useRecordGrowthCheckin, getGetGrowthQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

export function GrowthPage() {
  const { data: growth, isLoading } = useGetGrowth();
  const recordCheckin = useRecordGrowthCheckin();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [audience, setAudience] = useState("");

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const audNum = parseInt(audience, 10);
    if (isNaN(audNum) || audNum < 0) return;

    recordCheckin.mutate(
      { data: { audience: audNum } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetGrowthQueryKey() });
          setIsCheckingIn(false);
          setAudience("");
          toast({ title: "Growth check-in recorded" });
        }
      }
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>Growth</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Social growth.</h1>
          <p className="text-muted-foreground mt-1">Track your audience weekly check-ins.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : growth && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 rounded-3xl border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <CardContent className="p-8 md:p-10 relative z-10 flex flex-col h-full min-h-[300px] justify-between">
              <div>
                <p className="text-blue-100 font-medium mb-1 uppercase tracking-wider text-sm">Total Audience</p>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-6xl font-bold tracking-tight font-mono">{growth.audience.toLocaleString()}</span>
                </div>
                {growth.weeklyGrowth > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4 text-green-300" />
                    <span className="text-white">+{growth.weeklyGrowth.toLocaleString()} this week</span>
                    <span className="text-blue-200">({growth.growthPercent}%)</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                {isCheckingIn ? (
                  <form onSubmit={handleCheckin} className="flex flex-col sm:flex-row gap-3 bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                    <div className="flex-1">
                      <Input
                        type="number" min="0"
                        placeholder="Current audience count"
                        value={audience}
                        onChange={e => setAudience(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 rounded-xl font-mono h-12"
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsCheckingIn(false)} className="rounded-xl text-white hover:bg-white/10 h-12">Cancel</Button>
                      <Button type="submit" disabled={recordCheckin.isPending || !audience} className="rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold h-12">Save</Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-blue-200 text-sm">
                      Last check-in: {growth.lastCheckIn ? formatDistanceToNow(new Date(growth.lastCheckIn), { addSuffix: true }) : "Never"}
                    </p>
                    <Button variant="secondary" className="rounded-full shadow-lg font-semibold bg-white text-blue-700 hover:bg-blue-50" onClick={() => setIsCheckingIn(true)}>
                      <TrendingUp className="w-4 h-4 mr-2" /> Record Check-in
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border shadow-sm bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Growth Philosophy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-foreground leading-relaxed">
                  Avoid daily obsession with numbers. Check in once a week to track long-term trends instead of noise.
                </p>
                <div className="bg-muted p-4 rounded-2xl border border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> Meaningful Connections
                  </h4>
                  <p className="text-sm text-muted-foreground">True audience growth is about building trust over time, not viral spikes.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
