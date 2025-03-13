import mongoose from "mongoose";

const product = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },

    price: { type: Number, required: true }, // Changed to Number

    pictures: { type: String }, // Array of image URLs/paths

    isActive: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    barcode: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Product = mongoose.model("Product", product);
