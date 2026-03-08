import { Router } from "express";
import * as activitiesController from "../controllers/activities.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

const editorOrOwner = verifyTripRole("owner", "editor");

router.get(
  "/days",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(activitiesController.getDays)
);

router.patch(
  "/days/:dayId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(activitiesController.updateDay)
);

router.post(
  "/activities",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(activitiesController.create)
);

router.post(
  "/activities/reorder",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(activitiesController.reorder)
);

router.patch(
  "/activities/:activityId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(activitiesController.update)
);

router.delete(
  "/activities/:activityId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(activitiesController.remove)
);

export default router;
