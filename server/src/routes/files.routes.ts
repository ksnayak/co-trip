import { Router } from "express";
import * as filesController from "../controllers/files.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

const editorOrOwner = verifyTripRole("owner", "editor");

router.get(
  "/files",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(filesController.list)
);

router.post(
  "/files/upload-url",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(filesController.getUploadUrl)
);

router.post(
  "/files",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(filesController.register)
);

router.delete(
  "/files/:fileId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(filesController.remove)
);

export default router;
