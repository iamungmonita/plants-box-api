import { Router } from "express";
import { DailyLogged, initialCount, retrieveCount } from "../controllers/log";
const router = Router();

router.post("/count", initialCount);
router.get("/retrieve", retrieveCount);
router.post("/dailylog", DailyLogged);

export default router;
