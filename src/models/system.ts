import { Schema, Document, model } from 'mongoose';
import { User } from './auth'; // Ensure this is the correct path

interface IRole extends Document {
  name: string;
  codes: string[];
  createdBy: Schema.Types.ObjectId;
  remark?: string;
  isActive: boolean;
}

// Define Role Schema
const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, trim: true },
    codes: { type: [String], required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    remark: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

roleSchema.post<IRole>('findOneAndUpdate', async function (doc) {
  if (!doc) {
    console.log('No document found, exiting middleware.');
    return;
  }
  const { _id, codes } = doc as unknown as IRole;
  await User.updateMany({ role: _id }, { $set: { codes } });
});

const expenseSchema = new Schema(
  {
    category: {
      type: String,
      enum: ['Supplies', 'Inventory', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Other'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    remarks: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    supplier: { type: String, trim: true },
    invoice: { type: String, trim: true },
  },
  { timestamps: true },
);

// Define Voucher Schema
const voucherSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    discount: { type: Number, required: true, min: [0, 'Discount must be a positive number'] },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isExpired: { type: Boolean, default: true },
    updatedBy: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true },
);

// Export Models
const Role = model<IRole>('Role', roleSchema);
const Expense = model('Expense', expenseSchema);
const Voucher = model('Voucher', voucherSchema);

export { Expense, Role, Voucher };
