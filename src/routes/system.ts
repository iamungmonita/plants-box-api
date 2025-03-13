import { Router } from "express";
const router = Router();
import { create, getRoles } from "../controllers/system";

router.post("/create", create);
router.get("/retrieve", getRoles);

export default router;
