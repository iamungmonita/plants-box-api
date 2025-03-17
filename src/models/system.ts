import mongoose from 'mongoose';

const role = new mongoose.Schema(
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

export const Role = mongoose.model('roles', role);
