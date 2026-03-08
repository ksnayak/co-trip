import { createFileRoute, useParams } from "@tanstack/react-router";
import { MemberList } from "@/features/members/components/MemberList";
import { InviteDialog } from "@/features/members/components/InviteDialog";
import { useTripRole } from "@/hooks/useTripRole";
import { Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trips/$tripId/members")({
  component: MembersPage,
});

function MembersPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/members" });
  const { canEdit } = useTripRole();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Members
        </h2>
        {canEdit && <InviteDialog tripId={tripId} />}
      </div>
      <MemberList tripId={tripId} />
    </div>
  );
}
