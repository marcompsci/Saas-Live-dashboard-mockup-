import { useGetBudget, useListExpenses, useCreateExpense, useUpdateBudget, getListExpensesQueryKey, getGetBudgetQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Wallet, Plus, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

export function MoneyPage() {
  const { data: budget, isLoading: isBudgetLoading } = useGetBudget();
  const { data: expenses, isLoading: isExpensesLoading } = useListExpenses();
  const createExpense = useCreateExpense();
  const updateBudget = useUpdateBudget();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  const [newExpense, setNewExpense] = useState({ merchant: "", category: "general", amount: "", spentAt: new Date().toISOString() });
  const [newBudgetLimit, setNewBudgetLimit] = useState("");

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newExpense.amount);
    if (!newExpense.merchant || isNaN(amountNum) || amountNum <= 0) return;

    createExpense.mutate(
      { data: { ...newExpense, amount: amountNum } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetBudgetQueryKey() });
          setIsAdding(false);
          setNewExpense({ merchant: "", category: "general", amount: "", spentAt: new Date().toISOString() });
          toast({ title: "Expense added" });
        }
      }
    );
  };

  const handleUpdateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(newBudgetLimit);
    if (isNaN(limitNum) || limitNum <= 0) return;

    updateBudget.mutate(
      { data: { weeklyLimit: limitNum } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetBudgetQueryKey() });
          setIsEditingBudget(false);
          toast({ title: "Budget updated" });
        }
      }
    );
  };

  const isLoading = isBudgetLoading || isExpensesLoading;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-medium mb-4">
            <DollarSign className="w-4 h-4" />
            <span>Money</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Money in focus.</h1>
          <p className="text-muted-foreground mt-1">A gentle approach to weekly budgets.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="rounded-full shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Expense
          </Button>
        )}
      </div>

      {isAdding && (
        <Card className="border-emerald-500/20 bg-card rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2 lg:col-span-2">
                  <label className="text-sm font-medium text-foreground">Merchant / Description</label>
                  <Input
                    placeholder="e.g. Coffee shop"
                    value={newExpense.merchant}
                    onChange={e => setNewExpense({ ...newExpense, merchant: e.target.value })}
                    className="rounded-xl bg-muted/50 focus-visible:bg-white"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number" step="0.01" min="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                      className="pl-9 rounded-xl bg-muted/50 focus-visible:bg-white font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-end gap-2 mt-4 lg:mt-0">
                  <Button type="button" variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl flex-1">Cancel</Button>
                  <Button type="submit" disabled={createExpense.isPending || !newExpense.merchant || !newExpense.amount} className="rounded-xl flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      ) : budget && (
        <>
          <Card className="rounded-3xl border-0 shadow-lg overflow-hidden relative bg-emerald-600 text-white">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <CardContent className="p-8 md:p-10 relative z-10 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-emerald-100 font-medium mb-1 uppercase tracking-wider text-sm">Weekly Budget</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold tracking-tight font-mono">${budget.remaining.toFixed(2)}</span>
                    <span className="text-lg text-emerald-100 mb-1 font-mono">left</span>
                  </div>
                </div>
                {isEditingBudget ? (
                  <form onSubmit={handleUpdateBudget} className="flex items-center gap-2 bg-emerald-700/50 p-2 rounded-xl backdrop-blur-sm">
                    <Input
                      type="number" step="1"
                      placeholder="New limit"
                      value={newBudgetLimit}
                      onChange={e => setNewBudgetLimit(e.target.value)}
                      className="w-24 h-8 bg-transparent border-emerald-400 text-white placeholder:text-emerald-300 font-mono text-sm"
                    />
                    <Button type="submit" size="sm" variant="secondary" className="h-8 rounded-lg text-xs">Save</Button>
                    <Button type="button" size="sm" variant="ghost" className="h-8 rounded-lg text-xs text-white hover:bg-white/20" onClick={() => setIsEditingBudget(false)}>Cancel</Button>
                  </form>
                ) : (
                  <Button variant="ghost" size="sm" className="text-emerald-100 hover:text-white hover:bg-white/20 rounded-full" onClick={() => { setIsEditingBudget(true); setNewBudgetLimit(budget.weeklyLimit.toString()); }}>
                    Edit Limit (${budget.weeklyLimit})
                  </Button>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-white">${budget.spent.toFixed(2)} spent</span>
                  <span className="text-emerald-200">{budget.percentUsed.toFixed(0)}%</span>
                </div>
                <Progress value={budget.percentUsed} className="h-3 bg-emerald-800/40 [&>div]:bg-white rounded-full overflow-hidden" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border shadow-sm">
            <CardHeader className="border-b border-border/50 px-6 py-5">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-muted-foreground" /> Recent Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {expenses?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                  <Wallet className="w-12 h-12 mb-4 text-emerald-500/20" />
                  <p>No expenses recorded this week.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {expenses?.map(expense => (
                    <div key={expense.id} className="p-4 px-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{expense.merchant}</p>
                          <p className="text-xs text-muted-foreground capitalize">{expense.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-foreground">-${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {new Date(expense.spentAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
