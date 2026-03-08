import { Request, Response } from "express";
import * as commentsRepo from "../repositories/comments.repository";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const { target_type, target_id } = req.query;
  const comments = await commentsRepo.findByTripId(
    param(req, "tripId"),
    target_type as string | undefined,
    target_id as string | undefined
  );
  res.json(comments);
}

export async function create(req: Request, res: Response) {
  const comment = await commentsRepo.create({
    trip_id: param(req, "tripId"),
    target_type: req.body.target_type,
    target_id: req.body.target_id,
    body: req.body.body,
    author_id: req.user!.id,
  });
  res.status(201).json(comment);
}

export async function update(req: Request, res: Response) {
  const comment = await commentsRepo.update(
    param(req, "commentId"),
    req.body.body
  );
  res.json(comment);
}

export async function remove(req: Request, res: Response) {
  await commentsRepo.softDelete(param(req, "commentId"));
  res.status(204).end();
}
