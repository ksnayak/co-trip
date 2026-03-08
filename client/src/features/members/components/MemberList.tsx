import { UserMinus, Crown, Shield, Eye } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTripRole } from "@/hooks/useTripRole";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMembers, useUpdateMemberRole, useRemoveMember } from "../hooks/useMembers";
import { toast } from "sonner";
import type { TripMember } from "../members.types";

const roleIcons = { owner: Crown, editor: Shield, viewer: Eye };
const roleColors = {
  owner: "border-primary/30 text-primary",
  editor: "border-blue-500/30 text-blue-400",
  viewer: "",
};

export function MemberList({ tripId }: { tripId: string }) {
  const { data: members, isLoading } = useMembers(tripId);
  const { isOwner } = useTripRole();
  const { user } = useAuth();
  const updateRole = useUpdateMemberRole(tripId);
  const removeMember = useRemoveMember(tripId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({length: 3}).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!members?.length) return <p className="text-sm text-muted-foreground">No members yet</p>;

  const handleRoleChange = async (member: TripMember, role: string) => {
    try {
      await updateRole.mutateAsync({ memberId: member.id, role });
      toast.success(`Updated ${member.profile?.display_name || member.profile?.email}'s role`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (member: TripMember) => {
    try {
      await removeMember.mutateAsync(member.id);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  return (
    <div className="space-y-2">
      {members.map((member) => {
        const Icon = roleIcons[member.role];
        const isMe = member.user_id === user?.id;
        const initials = member.profile?.display_name?.split(" ").map(n => n[0]).join("").toUpperCase() || member.profile?.email?.[0]?.toUpperCase() || "?";

        return (
          <div key={member.id} className="flex items-center justify-between rounded-xl border border-border/50 bg-card/50 p-4 transition-colors hover:bg-card">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {member.profile?.display_name || member.profile?.email}
                  {isMe && <span className="ml-1.5 text-xs text-primary">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">{member.profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              {isOwner && !isMe && member.role !== "owner" ? (
                <Select value={member.role} onValueChange={(val) => handleRoleChange(member, val)}>
                  <SelectTrigger className="h-8 w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={`gap-1 ${roleColors[member.role] || ""}`}>
                  <Icon className="h-3 w-3" />
                  {member.role}
                </Badge>
              )}
              {isOwner && !isMe && member.role !== "owner" && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(member)}>
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
