import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    quantity: { type: Number, required: true },
    name: { type: String, required: true },
    discount: { type: String },
    isDiscountable: { type: Boolean, required: true },
    convertedPoints: { type: Number, required: true },
  },
  { _id: false },
);

const memberSchema = new mongoose.Schema(
  {
    fullname: { type: String },
    type: { type: String },
    phoneNumber: { type: String },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    purchasedId: { type: String, required: true },
    orders: [orderItemSchema],
    totalDiscountPercentage: { type: Number, default: 0 },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    createdBy: { type: String, required: true },
    totalDiscountValue: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    member: memberSchema,
    paidAmount: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Order = mongoose.model('Order', orderSchema);
