import * as membersRepo from "../repositories/members.repository";
import * as invitationsRepo from "../repositories/invitations.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";

export async function getMembers(tripId: string) {
  return membersRepo.findByTripId(tripId);
}

export async function updateRole(memberId: string, role: string) {
  if (!["owner", "editor", "viewer"].includes(role)) {
    throw new BadRequestError("Invalid role");
  }
  return membersRepo.updateRole(memberId, role);
}

export async function removeMember(memberId: string) {
  await membersRepo.remove(memberId);
}

export async function getInvitations(tripId: string) {
  return invitationsRepo.findByTripId(tripId);
}

export async function createInvitation(
  tripId: string,
  invitedBy: string,
  data: { invited_email: string; role: string }
) {
  if (!["editor", "viewer"].includes(data.role)) {
    throw new BadRequestError("Invalid invitation role");
  }

  return invitationsRepo.create({
    trip_id: tripId,
    invited_email: data.invited_email,
    role: data.role,
    invited_by: invitedBy,
  });
}

export async function acceptInvitation(token: string, userToken: string) {
  const invitation = await invitationsRepo.findByToken(token);
  if (!invitation) throw new NotFoundError("Invitation not found");

  if (invitation.status !== "pending") {
    throw new BadRequestError("Invitation has already been used");
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new BadRequestError("Invitation has expired");
  }

  await invitationsRepo.accept(token, userToken);
}
