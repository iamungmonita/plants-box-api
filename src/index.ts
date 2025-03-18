import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";

import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoute from "./routes/auth";
import orderRoute from "./routes/order";
import productRoute from "./routes/product";
import membershipRoute from "./routes/membership";
import systemRoute from "./routes/system";
import logRoute from "./routes/log";
import path from "path";
import fs from "fs";
import { Role } from "./models/system";
import multer from "multer";

dotenv.config();

const app: Application = express();

app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.101:3000",
      "http://192.168.1.101:3001",
      "http://172.21.7.41:3000",
      "http://172.21.7.41:3001",
    ],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["X-Requested-With", "Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/auth", authRoute);
app.use("/order", orderRoute);
app.use("/system", systemRoute);
app.use("/membership", membershipRoute);
app.use("/product", productRoute);
app.use("/log", logRoute);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
async function createIndexes() {
  try {
    await Role.init(); // Ensures indexes are created
  } catch (error) {
    console.error("Error creating indexes:", error);
  }
}
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log("Connected to MongoDB");
    createIndexes();
  })
  .catch((err) => console.error("Connection error", err));

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up uploads directory

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `products_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage: storage });

export const saveBase64Image = (
  base64String: string,
  filename: string
): string => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 format");

  const extension = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filePath = path.join(uploadDir, `${filename}.${extension}`);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}.${extension}`; // Return relative path
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});
