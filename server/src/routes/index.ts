import { Router } from "express";
import tripsRoutes from "./trips.routes";
import activitiesRoutes from "./activities.routes";
import membersRoutes from "./members.routes";
import commentsRoutes from "./comments.routes";
import checklistsRoutes from "./checklists.routes";
import expensesRoutes from "./expenses.routes";
import reservationsRoutes from "./reservations.routes";
import filesRoutes from "./files.routes";
import { verifyAuth } from "../middleware/auth";
import * as membersController from "../controllers/members.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use("/api/trips", tripsRoutes);
router.use("/api/trips/:tripId", activitiesRoutes);
router.use("/api/trips/:tripId", membersRoutes);
router.use("/api/trips/:tripId", commentsRoutes);
router.use("/api/trips/:tripId", checklistsRoutes);
router.use("/api/trips/:tripId", expensesRoutes);
router.use("/api/trips/:tripId", reservationsRoutes);
router.use("/api/trips/:tripId", filesRoutes);

router.post(
  "/api/invitations/:token/accept",
  verifyAuth,
  asyncHandler(membersController.acceptInvitation)
);

export default router;
