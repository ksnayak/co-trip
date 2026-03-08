import { Router } from "express";
import * as expensesController from "../controllers/expenses.controller";
import { verifyAuth } from "../middleware/auth";
import { verifyTripAccess } from "../middleware/tripAccess";
import { verifyTripRole } from "../middleware/tripRole";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router({ mergeParams: true });

const editorOrOwner = verifyTripRole("owner", "editor");

router.get(
  "/expenses",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(expensesController.list)
);

router.get(
  "/budget/summary",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(expensesController.summary)
);

router.get(
  "/budget/settlements",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(expensesController.settlements)
);

router.get(
  "/expenses/:expenseId",
  verifyAuth,
  verifyTripAccess,
  asyncHandler(expensesController.get)
);

router.post(
  "/expenses",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(expensesController.create)
);

router.patch(
  "/expenses/:expenseId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(expensesController.update)
);

router.delete(
  "/expenses/:expenseId",
  verifyAuth,
  verifyTripAccess,
  editorOrOwner,
  asyncHandler(expensesController.remove)
);

export default router;
