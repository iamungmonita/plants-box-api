import mongoose, { Schema } from 'mongoose';

const user = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
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
      type: Schema.Types.ObjectId,
      ref: 'Role', // Reference to the User collection
      required: false,
      default: null,
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
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection
      required: false,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection
      required: false,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

export const User = mongoose.model('User', user);
