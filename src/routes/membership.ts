import { Router } from "express";
const router = Router();

import {
  createMembership,
  getAllMembership,
  getMembershipById,
  updateMembershipPointsById,
} from "../controllers/membership";

router.post("/create", createMembership);
router.get("/retrieve", getAllMembership);
router.get("/retrieve/:id", getMembershipById);
router.put("/update-points/:phone", updateMembershipPointsById);

export default router;
