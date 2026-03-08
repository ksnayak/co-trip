import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight, Scale } from "lucide-react";
import { useSettlements } from "../hooks/useExpenses";

export function SettlementCard({ tripId, currencySymbol = "\u20B9" }: { tripId: string; currencySymbol?: string }) {
  const { data } = useSettlements(tripId);

  if (!data || data.settlements.length === 0) return null;

  return (
    <Card className="luxe-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="h-4 w-4 text-primary" />
          </div>
          Settlements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.settlements.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-destructive/10 text-[10px] font-medium text-destructive">
                    {s.from_name[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{s.from_name}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-green-500/10 text-[10px] font-medium text-green-600">
                    {s.to_name[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate">{s.to_name}</span>
              </div>
              <span className="text-sm font-semibold text-primary shrink-0 pl-9 sm:pl-0">
                {currencySymbol}{(s.amount_cents / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
