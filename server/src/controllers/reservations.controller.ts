import { Request, Response } from "express";
import * as reservationsRepo from "../repositories/reservations.repository";
import { NotFoundError } from "../utils/errors";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const reservations = await reservationsRepo.findByTripId(param(req, "tripId"));
  res.json(reservations);
}

export async function get(req: Request, res: Response) {
  const reservation = await reservationsRepo.findById(
    param(req, "reservationId")
  );
  if (!reservation) throw new NotFoundError("Reservation not found");
  res.json(reservation);
}

export async function create(req: Request, res: Response) {
  const reservation = await reservationsRepo.create({
    ...req.body,
    trip_id: param(req, "tripId"),
    created_by: req.user!.id,
  });
  res.status(201).json(reservation);
}

export async function update(req: Request, res: Response) {
  const reservation = await reservationsRepo.update(
    param(req, "reservationId"),
    req.body
  );
  res.json(reservation);
}

export async function remove(req: Request, res: Response) {
  await reservationsRepo.softDelete(param(req, "reservationId"));
  res.status(204).end();
}
