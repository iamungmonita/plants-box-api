import mongoose, { Schema } from 'mongoose';

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
      type: Schema.Types.ObjectId,
      ref: 'users', // Reference to the User collection
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'users', // Reference to the User collection
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

export const Membership = mongoose.model('membership', membership);
