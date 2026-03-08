import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Compass, Users, Calendar, Globe, Sparkles, Shield, Zap } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-primary/3 blur-[100px]" />

      <header className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 luxe-border">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">CoTrip</span>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 py-12 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-20">
          {/* Left: Hero content */}
          <div style={{ animation: "fade-in-up 0.6s ease-out" }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Collaborative trip planning
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Plan trips together,{" "}
              <span className="gold-text">effortlessly</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground max-w-lg">
              Build itineraries, track budgets, manage reservations, and collaborate
              with your travel crew — all in one beautifully crafted space.
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: "Drag & drop itineraries", desc: "Visual day-by-day planning" },
                { icon: Users, label: "Real-time collaboration", desc: "Plan together, travel together" },
                { icon: Globe, label: "Shared reservations", desc: "All bookings in one place" },
                { icon: Shield, label: "Budget tracking", desc: "Never overspend again" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="group flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 p-4 transition-all hover:border-primary/20 hover:bg-card">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                Free to use
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Secure & private
              </div>
            </div>
          </div>

          {/* Right: Login form */}
          <div className="flex justify-center lg:justify-end" style={{ animation: "fade-in-up 0.6s ease-out 0.15s both" }}>
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}
