import { Request, Response } from "express";
import * as tripsService from "../services/trips.service";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const trips = await tripsService.getTrips(req.user!.id);
  res.json(trips);
}

export async function get(req: Request, res: Response) {
  const trip = await tripsService.getTrip(param(req, "tripId"));
  res.json(trip);
}

export async function create(req: Request, res: Response) {
  const trip = await tripsService.createTrip(req.user!.id, req.body);
  res.status(201).json(trip);
}

export async function update(req: Request, res: Response) {
  const trip = await tripsService.updateTrip(param(req, "tripId"), req.body);
  res.json(trip);
}

export async function remove(req: Request, res: Response) {
  await tripsService.deleteTrip(param(req, "tripId"));
  res.status(204).end();
}
