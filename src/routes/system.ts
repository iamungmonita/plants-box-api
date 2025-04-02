import { Router } from 'express';
const router = Router();
import {
  createRole,
  createExpense,
  createVoucher,
  updateVoucherByBarcode,
  getAllExpenses,
  getAllVouchers,
  getRoles,
  getMonthlyExpenses,
  updateRoleById,
  getRoleById,
  getVoucherById,
  updateVoucherById,
  getExpenseById,
  updateExpenseById,
} from '../controllers/SystemController';

router.post('/create', createRole);
router.get('/retrieve', getRoles);
router.get('/retrieve-role/:id', getRoleById);
router.put('/update-role/:id', updateRoleById);
router.post('/create-expense', createExpense);
router.get('/retrieve-expenses', getAllExpenses);
router.get('/retrieve-expenses/:id', getExpenseById);
router.put('/expense/update/:id', updateExpenseById);
router.post('/create-voucher', createVoucher);
router.get('/retrieve-vouchers', getAllVouchers);
router.get('/voucher/:id', getVoucherById);
router.put('/voucher/update/:barcode', updateVoucherByBarcode);
router.put('/update-voucher/:id', updateVoucherById);
router.get('/expenses/monthly', getMonthlyExpenses);

export default router;
