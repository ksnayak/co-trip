import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBudgetSummary } from "../hooks/useExpenses";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { DollarSign, TrendingUp, AlertTriangle, AlertCircle } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

const COLORS = ["#D4A843", "#E8D5B7", "#C9956B", "#8B6914", "#A67C52", "#F0C987", "#7B6D8D", "#5C6B73"];

export function BudgetSummaryCard({ tripId }: { tripId: string }) {
  const { data: summary } = useBudgetSummary(tripId);
  const { data: trip } = useTrip(tripId);

  if (!summary) return null;

  const cs = getCurrencySymbol(trip?.currency);
  const spent = (summary.total_cents ?? 0) / 100;
  const budget = (trip?.budget_cents || 0) / 100;
  const remaining = budget - spent;
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const pieData = (summary.by_category || [])
    .filter((c) => c.total_cents > 0)
    .map((c) => ({ name: c.category || "Other", value: (c.total_cents ?? 0) / 100 }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="luxe-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            Budget Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budget > 0 && percent > 90 && (
              <Badge variant="destructive" className="gap-1 mb-3">
                <AlertCircle className="h-3 w-3" />
                Over 90% of budget used
              </Badge>
            )}
            {budget > 0 && percent > 75 && percent <= 90 && (
              <Badge variant="outline" className="gap-1 mb-3 border-amber-500/50 text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                Over 75% of budget used
              </Badge>
            )}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-semibold">{cs}{spent.toFixed(2)}{budget > 0 ? ` / ${cs}${budget.toFixed(2)}` : ""}</span>
              </div>
              {budget > 0 && (
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percent > 90 ? "bg-destructive" : percent > 70 ? "bg-primary/60" : "bg-primary"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
            {budget > 0 && (
              <p className={`text-sm font-medium ${remaining < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {remaining >= 0 ? `${cs}${remaining.toFixed(2)} remaining` : `${cs}${Math.abs(remaining).toFixed(2)} over budget`}
              </p>
            )}

            {(summary.by_member?.length ?? 0) > 0 && (
              <div className="border-t border-border/50 pt-4">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Spending by member
                </p>
                <div className="space-y-2">
                  {(summary.by_member || []).map((m) => (
                    <div key={m.user_id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{m.display_name || "Unknown"}</span>
                      <span className="font-medium">{cs}{((m.total_cents ?? 0) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pieData.length > 0 && (
        <Card className="luxe-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `${cs}${Number(val).toFixed(2)}`}
                  contentStyle={{
                    backgroundColor: "oklch(0.20 0.03 260)",
                    border: "1px solid oklch(0.30 0.03 270)",
                    borderRadius: "8px",
                    color: "oklch(0.95 0.02 90)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
