import { createFileRoute, useParams } from "@tanstack/react-router";
import { useExpenses } from "@/features/budget/hooks/useExpenses";
import { ExpenseTable } from "@/features/budget/components/ExpenseTable";
import { BudgetSummaryCard } from "@/features/budget/components/BudgetSummary";
import { AddExpenseDialog } from "@/features/budget/components/ExpenseForm";
import { SettlementCard } from "@/features/budget/components/SettlementCard";
import { useTripRole } from "@/hooks/useTripRole";
import { useTrip } from "@/features/trips/hooks/useTrips";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";
import { getCurrencySymbol } from "@/lib/currency";

export const Route = createFileRoute("/_authenticated/trips/$tripId/budget")({
  component: BudgetPage,
});

function BudgetPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/budget" });
  const { data: expenses, isLoading } = useExpenses(tripId);
  const { data: trip } = useTrip(tripId);
  const { canEdit } = useTripRole();
  const cs = getCurrencySymbol(trip?.currency);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Budget & Expenses
        </h2>
        {canEdit && <AddExpenseDialog tripId={tripId} currencySymbol={cs} />}
      </div>
      <BudgetSummaryCard tripId={tripId} />
      <SettlementCard tripId={tripId} currencySymbol={cs} />
      <ExpenseTable expenses={expenses || []} tripId={tripId} currencySymbol={cs} />
    </div>
  );
}
