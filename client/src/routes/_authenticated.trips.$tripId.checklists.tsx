import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChecklistPanel } from "@/features/checklists/components/ChecklistPanel";
import { ListChecks } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trips/$tripId/checklists")({
  component: ChecklistsPage,
});

function ChecklistsPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/checklists" });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <ListChecks className="h-5 w-5 text-primary" />
        Checklists
      </h2>
      <ChecklistPanel tripId={tripId} />
    </div>
  );
}
