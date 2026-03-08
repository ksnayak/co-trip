import { Router } from "express";
import * as reservationsController from "../controllers/reservations.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

const editorOrOwner = verifyTripRole("owner", "editor");

router.get(
  "/reservations",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(reservationsController.list)
);

router.get(
  "/reservations/:reservationId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(reservationsController.get)
);

router.post(
  "/reservations",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(reservationsController.create)
);

router.patch(
  "/reservations/:reservationId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(reservationsController.update)
);

router.delete(
  "/reservations/:reservationId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(reservationsController.remove)
);

export default router;
