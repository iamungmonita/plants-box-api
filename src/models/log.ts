import mongoose from "mongoose";

const log = new mongoose.Schema(
  {
    createdBy: { type: String, required: true }, // Counter identifier (e.g., user or transaction)
    riels: { type: mongoose.Schema.Types.Mixed, required: true }, // Riels (mixed structure)
    dollars: { type: mongoose.Schema.Types.Mixed, required: true }, // Dollars (mixed structure)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
export const Log = mongoose.model("logs", log);

const countLog = new mongoose.Schema(
  {
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const CountLog = mongoose.model("count_logs", countLog);
