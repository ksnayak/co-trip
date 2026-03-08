import { Request, Response } from "express";
import * as membersService from "../services/members.service";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const members = await membersService.getMembers(param(req, "tripId"));
  res.json(members);
}

export async function listInvitations(req: Request, res: Response) {
  const invitations = await membersService.getInvitations(param(req, "tripId"));
  res.json(invitations);
}

export async function updateRole(req: Request, res: Response) {
  const member = await membersService.updateRole(
    param(req, "memberId"),
    req.body.role
  );
  res.json(member);
}

export async function remove(req: Request, res: Response) {
  await membersService.removeMember(param(req, "memberId"));
  res.status(204).end();
}

export async function createInvitation(req: Request, res: Response) {
  const invitation = await membersService.createInvitation(
    param(req, "tripId"),
    req.user!.id,
    req.body
  );
  res.status(201).json(invitation);
}

export async function acceptInvitation(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Missing authorization" });
    return;
  }
  const token = authHeader.slice(7);
  await membersService.acceptInvitation(param(req, "token"), token);
  res.json({ ok: true });
}
