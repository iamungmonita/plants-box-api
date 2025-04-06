import mongoose, { Schema } from 'mongoose';

const log = new mongoose.Schema(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User collection
      required: true,
    },
    riels: { type: mongoose.Schema.Types.Mixed, required: true }, // Riels (mixed structure)
    dollars: { type: mongoose.Schema.Types.Mixed, required: true }, // Dollars (mixed structure)
    rielTotal: { type: Number, required: true }, // Dollars (mixed structure)
    dollarTotal: { type: Number, required: true }, // Dollars (mixed structure)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);
export const Log = mongoose.model('Log', log);

const countLog = new mongoose.Schema(
  {
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const CountLog = mongoose.model('Count', countLog);
