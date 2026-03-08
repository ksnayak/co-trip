import { useCallback, useState } from "react";
import { FileIcon, Trash2, Image, FileText, CloudUpload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useTripRole } from "@/hooks/useTripRole";
import { useFiles, useUploadFile, useDeleteFile } from "../hooks/useFiles";
import { toast } from "sonner";
import type { Attachment } from "../files.types";

function getFileIcon(mime: string | null) {
  if (mime?.startsWith("image/")) return Image;
  if (mime?.includes("pdf")) return FileText;
  return FileIcon;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileGrid({ tripId }: { tripId: string }) {
  const { data: files, isLoading } = useFiles(tripId);
  const upload = useUploadFile(tripId);
  const deleteFile = useDeleteFile(tripId);
  const { canEdit } = useTripRole();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const imageFiles = (files || []).filter((f) => f.mime_type?.startsWith("image/"));

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      for (const file of droppedFiles) {
        try {
          await upload.mutateAsync(file);
          toast.success(`Uploaded ${file.name}`);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
    },
    [upload],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(e.target.files || []);
      for (const file of selected) {
        try {
          await upload.mutateAsync(file);
          toast.success(`Uploaded ${file.name}`);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }
      e.target.value = "";
    },
    [upload],
  );

  const openPreview = (file: Attachment) => {
    const idx = imageFiles.findIndex((f) => f.id === file.id);
    if (idx >= 0) setPreviewIndex(idx);
  };

  const navigatePreview = (direction: number) => {
    if (previewIndex === null) return;
    const next = previewIndex + direction;
    if (next >= 0 && next < imageFiles.length) {
      setPreviewIndex(next);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({length: 4}).map((_, i) => (
          <div key={i} className="h-40 animate-pulse rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {canEdit && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 bg-card/30 p-10 text-muted-foreground hover:border-primary/40 hover:bg-card/50 transition-all cursor-pointer group"
        >
          {upload.isPending && upload.progress > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1.5 rounded-b-xl bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
          )}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-3 group-hover:bg-primary/15 transition-colors">
            <CloudUpload className="h-7 w-7 text-primary" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {upload.isPending ? `Uploading... ${upload.progress}%` : "Drop files here or click to upload"}
          </p>
          <p className="text-xs mt-1">Any file type, up to 50MB</p>
          <label className="mt-4">
            <Button variant="outline" size="sm" asChild disabled={upload.isPending}>
              <span>Choose files</span>
            </Button>
            <input type="file" multiple className="hidden" onChange={handleFileSelect} disabled={upload.isPending} />
          </label>
        </div>
      )}

      {!files?.length && !canEdit && (
        <div className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
            <FileIcon className="h-8 w-8 text-primary" />
          </div>
          <p className="font-medium">No files uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">Files shared by your team will appear here</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {files?.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            tripId={tripId}
            canEdit={canEdit}
            onDelete={deleteFile}
            onPreview={() => openPreview(file)}
          />
        ))}
      </div>

      {/* Lightbox preview */}
      <Dialog open={previewIndex !== null} onOpenChange={() => setPreviewIndex(null)}>
        <DialogContent className="max-w-4xl p-0 bg-black/95 border-none [&>button]:hidden">
          {previewIndex !== null && imageFiles[previewIndex] && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 text-white hover:bg-white/10"
                onClick={() => setPreviewIndex(null)}
              >
                <X className="h-5 w-5" />
              </Button>

              {previewIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 z-10 text-white hover:bg-white/10"
                  onClick={() => navigatePreview(-1)}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              <img
                src={imageFiles[previewIndex].file_url}
                alt={imageFiles[previewIndex].file_name}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {previewIndex < imageFiles.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 z-10 text-white hover:bg-white/10"
                  onClick={() => navigatePreview(1)}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/70 text-xs">
                {imageFiles[previewIndex].file_name} &middot; {previewIndex + 1}/{imageFiles.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FileCard({ file, canEdit, onDelete, onPreview }: {
  file: Attachment;
  tripId: string;
  canEdit: boolean;
  onDelete: ReturnType<typeof useDeleteFile>;
  onPreview: () => void;
}) {
  const Icon = getFileIcon(file.mime_type);
  const isImage = file.mime_type?.startsWith("image/");

  return (
    <Card
      className="group relative overflow-hidden border-border/50 transition-all hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
      onClick={isImage ? onPreview : undefined}
    >
      <div className="flex h-32 items-center justify-center bg-muted/30">
        {isImage ? (
          <img src={file.file_url} alt={file.file_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-medium truncate" title={file.file_name}>{file.file_name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {formatBytes(file.file_size)} · {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
        </p>
      </div>
      {canEdit && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onDelete.mutate(file.id); }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </Card>
  );
}
