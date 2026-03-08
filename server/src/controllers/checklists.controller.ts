import { Request, Response } from "express";
import * as checklistsRepo from "../repositories/checklists.repository";
import { supabase } from "../lib/supabase";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const checklists = await checklistsRepo.findByTripId(param(req, "tripId"));
  res.json(checklists);
}

export async function get(req: Request, res: Response) {
  const checklist = await checklistsRepo.findById(param(req, "checklistId"));
  res.json(checklist);
}

export async function create(req: Request, res: Response) {
  let position = req.body.position;
  if (position == null) {
    const tripId = param(req, "tripId");
    const { count } = await supabase
      .from("checklists")
      .select("id", { count: "exact", head: true })
      .eq("trip_id", tripId);
    position = count ?? 0;
  }

  const checklist = await checklistsRepo.create({
    trip_id: param(req, "tripId"),
    title: req.body.title,
    type: req.body.type || "custom",
    position,
    created_by: req.user!.id,
  });
  res.status(201).json(checklist);
}

export async function update(req: Request, res: Response) {
  const checklist = await checklistsRepo.update(
    param(req, "checklistId"),
    req.body
  );
  res.json(checklist);
}

export async function remove(req: Request, res: Response) {
  await checklistsRepo.remove(param(req, "checklistId"));
  res.status(204).end();
}

export async function createItem(req: Request, res: Response) {
  let position = req.body.position;
  if (position == null) {
    const checklistId = param(req, "checklistId");
    const { count } = await supabase
      .from("checklist_items")
      .select("id", { count: "exact", head: true })
      .eq("checklist_id", checklistId);
    position = count ?? 0;
  }

  const item = await checklistsRepo.createItem({
    checklist_id: param(req, "checklistId"),
    trip_id: param(req, "tripId"),
    label: req.body.label,
    assigned_to: req.body.assigned_to,
    position,
  });
  res.status(201).json(item);
}

export async function updateItem(req: Request, res: Response) {
  const item = await checklistsRepo.updateItem(param(req, "itemId"), req.body);
  res.json(item);
}

export async function reorderItems(req: Request, res: Response) {
  await checklistsRepo.reorderItems(req.body.items);
  res.json({ ok: true });
}

export async function removeItem(req: Request, res: Response) {
  await checklistsRepo.removeItem(param(req, "itemId"));
  res.status(204).end();
}
