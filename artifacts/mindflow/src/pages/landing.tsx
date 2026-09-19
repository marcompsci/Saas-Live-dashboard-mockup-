import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Waves, Brain, Activity, Wallet, Target } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="MindFlow" className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight">MindFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">Log in</Link>
            <Link href="/sign-up">
              <Button className="rounded-full shadow-sm">Build my flow</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground text-sm font-medium mb-8 border border-secondary">
              <Waves className="w-4 h-4" />
              <span>A personal operating system</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Your life, <br className="hidden md:block" />in one clear flow.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Turn habits, money, health, social growth, and goals into a calm daily plan. Make today feel possible.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full h-14 px-8 text-base shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                  Build my flow <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-base">
                See how it works
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 bg-muted/30 px-6 border-y border-border/50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Habits that stick</h3>
                <p className="text-muted-foreground">Build momentum quietly. Track what matters without the guilt of broken streaks.</p>
              </div>
              <div className="bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Money in focus</h3>
                <p className="text-muted-foreground">A gentle approach to weekly budgets. Know your limits without the anxiety.</p>
              </div>
              <div className="bg-card p-8 rounded-3xl shadow-sm border border-border">
                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 text-rose-600">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Health at a glance</h3>
                <p className="text-muted-foreground">Sleep, steps, and readiness. Listen to your body's signals daily.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6">
          <div className="max-w-3xl mx-auto text-center bg-primary text-primary-foreground p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="relative z-10">
              <Target className="w-12 h-12 mx-auto mb-6 opacity-80" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Your day has signals.<br/>Make them useful.</h2>
              <p className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto">
                Join a calmer way to track your life. We believe in privacy, consent, and owning your data.
              </p>
              <Link href="/sign-up">
                <Button size="lg" variant="secondary" className="rounded-full h-14 px-10 text-base font-semibold text-primary hover:bg-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  Start your flow
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <img src="/logo.svg" alt="MindFlow" className="w-6 h-6 grayscale" />
            <span className="font-semibold tracking-tight">MindFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            A personal space for intentional living.
          </p>
        </div>
      </footer>
    </div>
  );
}
