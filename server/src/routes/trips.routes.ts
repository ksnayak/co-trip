import { Router } from "express";
import * as tripsController from "../controllers/trips.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", verifyAuth, asyncHandler(tripsController.create));
router.get("/", verifyAuth, asyncHandler(tripsController.list));

router.get(
  "/:tripId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(tripsController.get)
);

router.patch(
  "/:tripId",
  verifyAuth,
  verifyTripAccess,
  verifyTripRole("owner", "editor"),
  asyncHandler(tripsController.update)
);

router.delete(
  "/:tripId",
  verifyAuth,
  verifyTripAccess,
  verifyTripRole("owner"),
  asyncHandler(tripsController.remove)
);

export default router;
