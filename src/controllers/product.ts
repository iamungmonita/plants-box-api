import { saveBase64Image } from "..";
import { Product } from "../models/products";
import { Response, Request } from "express";

export const create = async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    type,
    price,
    description,
    size,
    instruction,
    habit,
    temperature,
    stock,
  } = req.body;
  try {
    if (
      !name ||
      !type ||
      !price ||
      !description ||
      !size ||
      !instruction ||
      !habit ||
      !temperature ||
      !stock
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const product = await Product.create({
      name,
      type,
      price,
      description,
      instruction,
      size,
      temperature,
      stock,
      habit,
    });

    res.status(200).json({ message: "Created successfully", product });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as any).code === 11000
    ) {
      res.status(400).json({
        name: "name",
        message: `This name already registered`,
      });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const retrieve = async (req: Request, res: Response): Promise<void> => {
  const { name, type, category, barcode } = req.query;
  try {
    const filter: any = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: "i" } }); // Partial match, case-insensitive
    }

    if (barcode) {
      Object.assign(filter, { barcode: { $regex: barcode, $options: "i" } }); // Partial match, case-insensitive
    }

    if (type) {
      Object.assign(filter, { type }); // Exact match since it's an autocomplete value
    }

    if (category) {
      Object.assign(filter, { category }); // Exact match since it's an autocomplete value
    }
    const products = await Product.find(filter);

    res.status(200).json(products);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const findProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json(error);
  }
};
export const updateProductQuantityById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Request Body:", req.body); // Debugging line

    const { id } = req.params;
    const { qty } = req.body;

    if (typeof qty !== "number" || qty < 0) {
      res.status(400).json({ message: "Invalid stock value" });
      return;
    }
    const matchingProduct = await Product.findById(id);
    if (!matchingProduct) {
      res.status(400).json({ message: "cannot find product" });
      return;
    }
    console.log("Current stock:", matchingProduct.stock);
    console.log("Qty to subtract:", qty);
    const newStock = matchingProduct?.stock - qty;

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { stock: newStock } },
      { new: true, runValidators: true }
    );

    // if (!product) {
    //   res.status(404).json({ message: "Product not found" });
    //   return;
    // }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
export const updateProductDetailsById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Request Body:", req.body); // Debugging line

    const { id } = req.params;
    const { pictures, ...data } = req.body;

    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (pictures) {
      const savedImages = await saveBase64Image(
        pictures,
        `product_${Date.now()}`
      );
      product.pictures = savedImages;
      await product.save();
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error updating product stock:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
