import mongoose, { Schema } from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    codes: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users', // Reference to the User collection
      required: true,
    },
    remark: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);
const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Supplies', 'Inventory', 'Utilities', 'Rent', 'Salaries', 'Marketing', 'Other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users', // Reference to the User collection
      required: true,
    },
    supplier: {
      type: String, // Store supplier or vendor name if applicable
      trim: true,
    },
    invoice: {
      type: String, // ✅ Changed from String to Array of Strings
      trim: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt
);

const voucherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true, // Ensures the voucher code is unique
      trim: true,
    },
    discount: {
      type: Number,
      required: true,
      min: [0, 'Discount must be a positive number'], // Enforces a positive discount
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true, // Voucher is active by default
    },
    isExpired: {
      type: Boolean,
      default: true, // Voucher is active by default
    },
    updatedBy: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users', // Reference to the User collection
      required: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt
);

const Role = mongoose.model('Role', roleSchema); // Singular, as Mongoose auto-pluralizes it
const Expense = mongoose.model('Expense', expenseSchema);
const Voucher = mongoose.model('Voucher', voucherSchema);

export { Expense, Role, Voucher };
