import { Router } from "express";
const router = Router();
import {
  authentication,
  fetchProfile,
  signIn,
  signOut,
  signUp,
} from "../controllers/auth";

router.post("/sign-up", signUp);
router.post("/signout", signOut);
router.post("/signin", signIn);
router.get("/profile", authentication, fetchProfile);

export default router;
