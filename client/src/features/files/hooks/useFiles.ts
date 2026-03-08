import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { axiosInstance } from "@/lib/api";
import type { Attachment } from "../files.types";

export function useFiles(tripId: string) {
  return useQuery({
    queryKey: ["files", tripId],
    queryFn: () => api.get<Attachment[]>(`/api/trips/${tripId}/files`),
    enabled: !!tripId,
  });
}

export function useUploadFile(tripId: string) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      setProgress(0);

      const { signedUrl, path } = await api.post<{ signedUrl: string; path: string }>(
        `/api/trips/${tripId}/files/upload-url`,
        { fileName: file.name, mimeType: file.type },
      );

      await axiosInstance.put(signedUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      });

      setProgress(100);

      return api.post<Attachment>(`/api/trips/${tripId}/files`, {
        file_name: file.name,
        file_url: path,
        file_size: file.size,
        mime_type: file.type,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files", tripId] });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  const reset = useCallback(() => setProgress(0), []);

  return { ...mutation, progress, resetProgress: reset };
}

export function useDeleteFile(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fileId: string) => api.delete(`/api/trips/${tripId}/files/${fileId}`),
    onMutate: async (fileId) => {
      await qc.cancelQueries({ queryKey: ["files", tripId] });
      const previous = qc.getQueryData<Attachment[]>(["files", tripId]);

      qc.setQueryData<Attachment[]>(["files", tripId], (old) => {
        if (!old) return old;
        return old.filter((f) => f.id !== fileId);
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["files", tripId], context.previous);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["files", tripId] }),
  });
}
