import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAcceptInvitation } from "@/features/members/hooks/useMembers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass, Check, X } from "lucide-react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Route = createFileRoute("/invite/$token")({
  component: InviteAccept,
});

function InviteAccept() {
  const { token } = useParams({ from: "/invite/$token" });
  const { user, loading: authLoading } = useAuth();
  const acceptInvitation = useAcceptInvitation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "accepting" | "done" | "error">("idle");

  const handleAccept = async () => {
    setStatus("accepting");
    try {
      await acceptInvitation.mutateAsync(token);
      setStatus("done");
      setTimeout(() => navigate({ to: "/dashboard" }), 1500);
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (user && status === "idle") {
      handleAccept();
    }
  }, [user, status]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-background relative overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="relative flex items-center gap-2.5 text-xl font-bold">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 luxe-border">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          CoTrip
        </div>
        <p className="text-muted-foreground">Sign in to accept your trip invitation</p>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm luxe-border">
        <CardHeader className="text-center">
          <CardTitle>
            {status === "done" ? (
              <span className="flex items-center justify-center gap-2 text-primary">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-4 w-4" />
                </div>
                Invitation accepted
              </span>
            ) : status === "error" ? (
              <span className="flex items-center justify-center gap-2 text-destructive">
                <X className="h-5 w-5" /> Something went wrong
              </span>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Accepting invitation...
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {status === "done" && "Redirecting to your dashboard..."}
            {status === "error" && "The invitation may be expired or already used."}
            {status === "accepting" && "Please wait..."}
          </CardDescription>
        </CardHeader>
        {status === "error" && (
          <CardContent>
            <Button className="w-full" onClick={() => navigate({ to: "/dashboard" })}>
              Go to dashboard
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
