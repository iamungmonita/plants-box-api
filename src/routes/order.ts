import { Router } from "express";
const router = Router();

import {
  createOrder,
  getPurchasedOrderByProductId,
  retrieve,
} from "../controllers/order";

router.post("/create", createOrder);
router.get("/retrieve", retrieve);
router.get("/retrieve/:id", getPurchasedOrderByProductId);

export default router;
