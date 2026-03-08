import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/errors";

export function verifyTripRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.tripRole || !roles.includes(req.tripRole)) {
        throw new ForbiddenError("Insufficient permissions for this action");
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
