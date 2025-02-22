import { Router } from "express";
const router = Router();
import {
  create,
  findProductById,
  retrieve,
  updateProductQuantityById,
  updateProductDetailsById,
} from "../controllers/product";

router.post("/create", create);
router.get("/retrieve", retrieve);
router.get("/:id", findProductById);
router.put("/update/:id", updateProductQuantityById);
router.put("/update-details/:id", updateProductDetailsById);

export default router;
