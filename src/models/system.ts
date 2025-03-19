import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    codes: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    remarks: {
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

const Role = mongoose.model('Role', roleSchema); // Singular, as Mongoose auto-pluralizes it

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
      type: String, // Store supplier or vendor name if applicable
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

const Expense = mongoose.model('Expense', expenseSchema);

const voucherSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }, // Automatically adds createdAt and updatedAt
);

const Voucher = mongoose.model('Voucher', voucherSchema);

// Export using ES6
export { Expense, Role, Voucher };
