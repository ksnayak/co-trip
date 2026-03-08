import { createFileRoute, useParams } from "@tanstack/react-router";
import { FileGrid } from "@/features/files/components/FileGrid";
import { FolderOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trips/$tripId/files")({
  component: FilesPage,
});

function FilesPage() {
  const { tripId } = useParams({ from: "/_authenticated/trips/$tripId/files" });
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FolderOpen className="h-5 w-5 text-primary" />
        Files
      </h2>
      <FileGrid tripId={tripId} />
    </div>
  );
}
