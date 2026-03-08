import { Router } from "express";
import * as membersController from "../controllers/members.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

router.get(
  "/members",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(membersController.list)
);

router.get(
  "/invitations",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(membersController.listInvitations)
);

router.post(
  "/invitations",
  verifyAuth,
  verifyTripAccess,
  verifyTripRole("owner", "editor"),
  asyncHandler(membersController.createInvitation)
);

router.patch(
  "/members/:memberId",
  verifyAuth,
  verifyTripAccess,
  verifyTripRole("owner"),
  asyncHandler(membersController.updateRole)
);

router.delete(
  "/members/:memberId",
  verifyAuth,
  verifyTripAccess,
  verifyTripRole("owner"),
  asyncHandler(membersController.remove)
);

export default router;
