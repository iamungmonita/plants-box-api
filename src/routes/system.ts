import { Router } from "express";
const router = Router();
import {
  create,
  createExpense,
  createVoucher,
  updateVoucherByBarcode,
  getAllExpenses,
  getAllVouchers,
  getRoles,
} from "../controllers/system";

router.post("/create", create);
router.get("/retrieve", getRoles);
router.post("/create-expense", createExpense);
router.get("/retrieve-expenses", getAllExpenses);
router.post("/create-voucher", createVoucher);
router.get("/retrieve-vouchers", getAllVouchers);
router.put("/update-voucher/:barcode", updateVoucherByBarcode);

export default router;
