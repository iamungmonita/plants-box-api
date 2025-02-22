import mongoose from "mongoose";

const product = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    type: { type: String, required: true, trim: true },
    price: { type: Number, required: true }, // Changed to Number
    description: { type: String },
    pictures: { type: [String], required: true }, // Array of image URLs/paths
    size: { type: String, required: true },
    temperature: { type: String },
    instruction: { type: String },
    habit: { type: String },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Product = mongoose.model("Product", product);
