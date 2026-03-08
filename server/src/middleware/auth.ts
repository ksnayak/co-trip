import { Request, Response, NextFunction } from "express";
import { supabase } from "../lib/supabase";
import { UnauthorizedError } from "../utils/errors";

export async function verifyAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing authorization token");
    }

    const token = header.slice(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
