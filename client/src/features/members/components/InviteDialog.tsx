import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInviteMember, useInvitations } from "../hooks/useMembers";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { InviteInput } from "../members.types";

export function InviteDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const invite = useInviteMember(tripId);
  const { data: invitations } = useInvitations(tripId);

  const pendingInvitations = invitations?.filter((i) => i.status === "pending") || [];

  const handleInvite = async () => {
    if (!email.trim()) return;
    try {
      await invite.mutateAsync({ email: email.trim(), role } as InviteInput);
      toast.success(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send invitation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Send className="h-4 w-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a collaborator</DialogTitle>
          <DialogDescription>Send an invitation to join this trip.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="h-11"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "editor" | "viewer")}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Editor — can add and edit content</SelectItem>
                <SelectItem value="viewer">Viewer — read-only access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInvite} disabled={invite.isPending || !email.trim()} className="h-11">
            {invite.isPending ? "Sending..." : "Send invitation"}
          </Button>

          {pendingInvitations.length > 0 && (
            <div className="border-t border-border/50 pt-4">
              <p className="mb-3 text-sm font-medium">Pending invitations</p>
              <div className="space-y-2">
                {pendingInvitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-sm">
                    <span className="text-muted-foreground truncate">{inv.invited_email}</span>
                    <Badge variant="secondary" className="text-xs shrink-0 ml-2">{inv.role}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
