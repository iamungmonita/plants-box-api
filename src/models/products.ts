import mongoose from 'mongoose';

const StockUpdateSchema = new mongoose.Schema(
  {
    updateNumber: { type: Number, required: true },
    oldStock: { type: Number, required: true },
    addedStock: { type: Number, required: true },
  },
  {
    timestamps: true, // This enables createdAt and updatedAt for stock updates
  },
);

const product = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    createdBy: { type: String },
    updatedBy: { type: String },
    price: { type: Number, required: true, min: 0 }, // Changed to Number
    importedPrice: { type: Number, required: true, min: 0 }, // Changed to Number
    pictures: { type: String }, // Array of image URLs/paths
    isDiscountable: { type: Boolean, required: true, default: true },
    isActive: { type: Boolean, required: true, default: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    updatedCount: [StockUpdateSchema],
    soldQty: { type: Number, default: 0 },
    discountedPrice: { type: Number, required: true, min: 0 }, // Changed to Number
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

export const Product = mongoose.model('Product', product);
