import mongoose from "mongoose";

const membership = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 9,
      unique: true,
    },

    type: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    invoices: {
      type: [String],
      required: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Membership = mongoose.model("membership", membership);
