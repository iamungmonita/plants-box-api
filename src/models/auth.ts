import mongoose from "mongoose";

const user = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
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
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const User = mongoose.model("users", user);
