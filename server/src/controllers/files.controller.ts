import { Request, Response } from "express";
import * as filesRepo from "../repositories/files.repository";
import { param } from "../utils/params";

export async function list(req: Request, res: Response) {
  const files = await filesRepo.findByTripId(param(req, "tripId"));
  res.json(files);
}

export async function getUploadUrl(req: Request, res: Response) {
  const { fileName } = req.body;
  const result = await filesRepo.getSignedUploadUrl(
    param(req, "tripId"),
    fileName
  );
  res.json(result);
}

export async function register(req: Request, res: Response) {
  const attachment = await filesRepo.create({
    trip_id: param(req, "tripId"),
    file_name: req.body.file_name,
    file_url: req.body.file_url,
    file_size: req.body.file_size,
    mime_type: req.body.mime_type,
    target_type: req.body.target_type,
    target_id: req.body.target_id,
    uploaded_by: req.user!.id,
  });
  res.status(201).json(attachment);
}

export async function remove(req: Request, res: Response) {
  await filesRepo.remove(param(req, "fileId"));
  res.status(204).end();
}
