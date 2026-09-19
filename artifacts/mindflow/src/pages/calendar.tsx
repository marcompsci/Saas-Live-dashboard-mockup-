import { usePrepareCalendarAction, useExportCalendarIcs } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Download, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export function CalendarPage() {
  const prepareAction = usePrepareCalendarAction();
  const exportIcs = useExportCalendarIcs();
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    detail: "",
    date: format(new Date(), "yyyy-MM-dd"),
    startTime: "09:00",
    durationMinutes: "30"
  });

  const [preparedData, setPreparedData] = useState<any>(null);

  const handlePrepare = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = parseInt(form.durationMinutes, 10);
    if (!form.title || !form.detail || !form.date || !form.startTime || isNaN(duration) || duration < 5) return;

    prepareAction.mutate(
      { data: { ...form, durationMinutes: duration } },
      {
        onSuccess: (data) => {
          setPreparedData(data);
          toast({ title: "Action prepared for calendar" });
        },
        onError: () => {
          toast({ title: "Failed to prepare action", variant: "destructive" });
        }
      }
    );
  };

  const handleExportIcs = () => {
    const duration = parseInt(form.durationMinutes, 10);
    if (!form.title || !form.detail || !form.date || !form.startTime || Number.isNaN(duration) || duration < 5) {
      toast({ title: "Prepare an action before exporting", variant: "destructive" });
      return;
    }
    exportIcs.mutate({ data: { ...form, durationMinutes: duration } }, {
      onSuccess: (data) => {
        // Create blob and download
        const blob = new Blob([data.content], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", data.filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Calendar exported successfully" });
      },
      onError: () => {
        toast({ title: "Failed to export calendar", variant: "destructive" });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-4">
            <CalendarDays className="w-4 h-4" />
            <span>Time Blocks</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Protect your time.</h1>
          <p className="text-muted-foreground mt-1">Prepare next actions for your external calendar.</p>
        </div>
        <Button data-testid="button-export-ics" onClick={handleExportIcs} variant="outline" className="rounded-full shadow-sm" disabled={exportIcs.isPending || !preparedData}>
          <Download className="w-4 h-4 mr-2" /> Export .ICS
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-2xl border border-border flex items-start gap-3">
        <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>Note:</strong> MindFlow respects your privacy. We do not sync live data to your calendar automatically.
          Use this tool to prepare structured blocks and manually add them via Google Calendar or ICS export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border border-border shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/50 px-8 py-6">
            <CardTitle className="text-xl">Prepare your next action for the calendar.</CardTitle>
            <CardDescription>Structure a dedicated time block.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handlePrepare} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Action Title</label>
                <Input
                  placeholder="e.g. Deep Work: Q3 Planning"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="rounded-xl h-12 bg-muted/50 border-transparent focus-visible:bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Details / Context</label>
                <Input
                  placeholder="Goals for this block"
                  value={form.detail}
                  onChange={e => setForm({ ...form, detail: e.target.value })}
                  className="rounded-xl h-12 bg-muted/50 border-transparent focus-visible:bg-background"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="rounded-xl h-12 bg-muted/50 border-transparent focus-visible:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Start Time</label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="rounded-xl h-12 bg-muted/50 border-transparent focus-visible:bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Duration (m)</label>
                  <Input
                    type="number" min="5" step="5"
                    value={form.durationMinutes}
                    onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                    className="rounded-xl h-12 bg-muted/50 border-transparent focus-visible:bg-background font-mono"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-2xl h-14 text-base font-medium shadow-md hover:-translate-y-0.5 transition-all" disabled={prepareAction.isPending || !form.title}>
                Generate Calendar Link
              </Button>
            </form>
          </CardContent>
        </Card>

        <div>
          {preparedData ? (
            <Card className="rounded-3xl border-0 shadow-lg bg-gradient-to-br from-purple-600 to-indigo-700 text-white overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_42%)] opacity-80"></div>
              <CardContent className="p-8 md:p-10 relative z-10 flex flex-col h-full justify-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Block Prepared</h3>
                <p className="text-purple-200 mb-8">{preparedData.title}</p>

                <a
                  href={preparedData.googleCalendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white text-purple-700 font-semibold px-8 py-4 rounded-2xl hover:bg-purple-50 transition-colors shadow-xl"
                >
                  Open in Google Calendar <ExternalLink className="w-4 h-4" />
                </a>
                <p className="mt-6 text-xs text-purple-300 opacity-80">{preparedData.disclaimer}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl p-10 text-center bg-card/50">
              <CalendarDays className="w-16 h-16 text-muted-foreground/30 mb-6" />
              <h3 className="text-xl font-semibold mb-2">Ready when you are</h3>
              <p className="text-muted-foreground">Fill out the form to generate a quick link to add the block directly to your external calendar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
