import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    purchasedId: { type: String, required: true },
    orders: [
      {
        _id: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, required: true },
        quantity: { type: Number, required: true },
        name: { type: String, required: true },
        size: { type: String, required: true },
      },
    ],
    discount: { type: Number },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    createdBy: { type: String, required: true },
    discountedAmount: { type: Number, required: true },
    calculatedDiscount: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

export const Order = mongoose.model("Order", orderSchema);
