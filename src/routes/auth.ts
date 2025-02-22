import { Router } from "express";
const router = Router();
import {
  authentication,
  fetchProfile,
  register,
  signIn,
  signOut,
} from "../controllers/auth";

router.post("/register", register);
router.post("/signout", signOut);
router.post("/signin", signIn);
router.get("/profile", authentication, fetchProfile);

export default router;
