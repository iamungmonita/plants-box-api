import mongoose from "mongoose";

const countSchema = new mongoose.Schema(
  {
    usd: { type: Number, required: false }, // USD value (optional)
    khr: { type: Number, required: false }, // KHR value (optional)
    counter: { type: String, required: true }, // Counter identifier (e.g., user or transaction)
    riels: { type: mongoose.Schema.Types.Mixed, required: true }, // Riels (mixed structure)
    dollars: { type: mongoose.Schema.Types.Mixed, required: true }, // Dollars (mixed structure)
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);
export const Count = mongoose.model("Count", countSchema);
const DailyLogged = new mongoose.Schema({
  userId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export const Logged = mongoose.model("Log", DailyLogged);
