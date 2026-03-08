import { Router } from "express";
import * as commentsController from "../controllers/comments.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

router.get(
  "/comments",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(commentsController.list)
);

router.post(
  "/comments",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(commentsController.create)
);

router.patch(
  "/comments/:commentId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(commentsController.update)
);

router.delete(
  "/comments/:commentId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(commentsController.remove)
);

export default router;
