import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { TripRole } from "../types";
import { param } from "../utils/params";

export async function verifyTripAccess(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const tripId = param(req, "tripId") || param(req, "id");
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    const userId = req.user.id;

    const { data: member } = await supabase
      .from("trip_members")
      .select("role")
      .eq("trip_id", tripId)
      .eq("user_id", userId)
      .single();

    if (!member) {
      throw new ForbiddenError("You are not a member of this trip");
    }

    req.tripRole = member.role as TripRole;
    next();
  } catch (err) {
    next(err);
  }
}
