import { Request, Response } from "express";
import * as activitiesService from "../services/activities.service";
import { param } from "../utils/params";

export async function getDays(req: Request, res: Response) {
  const days = await activitiesService.getDaysWithActivities(
    param(req, "tripId")
  );
  res.json(days);
}

export async function updateDay(req: Request, res: Response) {
  const day = await activitiesService.updateDay(param(req, "dayId"), req.body);
  res.json(day);
}

export async function create(req: Request, res: Response) {
  const activity = await activitiesService.createActivity(req.user!.id, {
    ...req.body,
    trip_id: param(req, "tripId"),
  });
  res.status(201).json(activity);
}

export async function update(req: Request, res: Response) {
  const activity = await activitiesService.updateActivity(
    param(req, "activityId"),
    req.body
  );
  res.json(activity);
}

export async function remove(req: Request, res: Response) {
  await activitiesService.deleteActivity(param(req, "activityId"));
  res.status(204).end();
}

export async function reorder(req: Request, res: Response) {
  await activitiesService.reorderActivities(req.body.items);
  res.json({ ok: true });
}
