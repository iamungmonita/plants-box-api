import mongoose, { Schema } from 'mongoose';

const user = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 9,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
    },
    codes: {
      type: [String],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    pictures: { type: String }, // Array of image URLs/paths
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

export const User = mongoose.model('users', user);
