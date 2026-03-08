import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useComments, useCreateComment, useDeleteComment } from "../hooks/useComments";
import type { CreateCommentInput } from "../comments.types";

type Props = {
  tripId: string;
  targetType: "day" | "activity";
  targetId: string;
};

export function CommentThread({ tripId, targetType, targetId }: Props) {
  const { data: comments } = useComments(tripId, targetType, targetId);
  const createComment = useCreateComment(tripId);
  const deleteComment = useDeleteComment(tripId);
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    const input: CreateCommentInput = { target_type: targetType, target_id: targetId, body: body.trim() };
    await createComment.mutateAsync(input);
    setBody("");
  };

  return (
    <div className="space-y-3">
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <div key={comment.id} className="flex gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="text-[10px]">
                {comment.author?.display_name?.[0]?.toUpperCase() || comment.author?.email?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{comment.author?.display_name || comment.author?.email || "Unknown"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-foreground/80">{comment.body}</p>
            </div>
            {comment.author_id === user?.id && (
              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100" onClick={() => deleteComment.mutate(comment.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))
      ) : !showInput ? (
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowInput(true)}>
          <MessageSquare className="h-3.5 w-3.5" />
          Add a comment
        </button>
      ) : null}

      {(showInput || (comments && comments.length > 0)) && (
        <div className="flex gap-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a comment..." className="min-h-[60px] text-sm" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }} />
          <Button size="sm" onClick={handleSubmit} disabled={!body.trim() || createComment.isPending} className="self-end">
            Post
          </Button>
        </div>
      )}
    </div>
  );
}
