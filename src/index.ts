import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoute from "./routes/auth";
import orderRoute from "./routes/order";
import productRoute from "./routes/product";
import path from "path";
import fs from "fs";
import { Product } from "./models/products";

dotenv.config();

const app: Application = express();

// Middleware
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 images
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://192.168.1.101:3000",
      "http://192.168.1.101:3001",
    ],
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["X-Requested-With", "Content-Type"],
    credentials: true,
  })
);
app.use("/auth", authRoute);
app.use("/order", orderRoute);
app.use("/product", productRoute);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error", err));

// Routes
app.get("/", (req: Request, res: Response): void => {
  console.log("Reached / route");
  res.send("Hello World!");
});

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const saveBase64Image = (base64String: string, filename: string): string => {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 format");

  const extension = matches[1].split("/")[1];
  const buffer = Buffer.from(matches[2], "base64");
  const filePath = path.join(uploadDir, `${filename}.${extension}`);

  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}.${extension}`; // Return relative path
};

app.post(
  "/upload",

  async (req: Request, res: Response) => {
    // Log request body
    try {
      const {
        name,
        price,
        type,
        description,
        pictures,
        size,
        instruction,
        habit,
        temperature,
        stock,
        category,
      } = req.body;

      if (
        !name ||
        !price ||
        !type ||
        !pictures ||
        !size ||
        !stock ||
        !category
      ) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Save images and return file paths
      const savedImages = pictures.map((base64: string, index: number) =>
        saveBase64Image(base64, `product_${Date.now()}_${index}`)
      );

      const productData = {
        name,
        price,
        type,
        description,
        pictures: savedImages,
        size,
        instruction,
        temperature,
        habit,
        stock,
        category,
      };
      const product = await Product.create(productData);

      console.log("Received product data:", productData);

      res.status(200).json({
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.error("Error uploading product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}`);
});
