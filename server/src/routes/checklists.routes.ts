import { Router } from "express";
import * as checklistsController from "../controllers/checklists.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

const editorOrOwner = verifyTripRole("owner", "editor");

router.get(
  "/checklists",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(checklistsController.list)
);

router.get(
  "/checklists/:checklistId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(checklistsController.get)
);

router.post(
  "/checklists",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.create)
);

router.patch(
  "/checklists/:checklistId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.update)
);

router.delete(
  "/checklists/:checklistId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.remove)
);

router.post(
  "/checklists/:checklistId/items/reorder",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.reorderItems)
);

router.post(
  "/checklists/:checklistId/items",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.createItem)
);

router.patch(
  "/checklists/:checklistId/items/:itemId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(checklistsController.updateItem)
);

router.delete(
  "/checklists/:checklistId/items/:itemId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(checklistsController.removeItem)
);

export default router;
