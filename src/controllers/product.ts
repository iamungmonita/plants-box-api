import { Request, Response } from 'express';

import { saveBase64Image } from '../helpers/file';
import { Product } from '../models/products';
import { Admin } from 'mongodb';
import { User } from '../models/auth';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      barcode,
      isActive,
      name,
      price,
      pictures,
      stock,
      category,
      importedPrice,
      isDiscountable,
    } = req.body;

    if (
      !name ||
      !price ||
      !importedPrice ||
      !stock ||
      !category ||
      !isDiscountable ||
      !isActive ||
      !barcode
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Save images and return file paths
    let savedImages = ''; // Declare savedImages in a broader scope

    if (pictures && pictures !== '') {
      savedImages = await saveBase64Image(pictures, `product_${Date.now()}`);
    }
    const admin = await User.findById(req.admin);

    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel.' });
      return;
    }

    const productInfo = {
      name,
      price,
      importedPrice,
      pictures: savedImages,
      stock,
      category,
      barcode,
      isActive,
      isDiscountable,
      updatedBy: admin.firstName,
      createdBy: admin.firstName,
    };

    const product = await Product.create(productInfo);

    if (!product) {
      res.status(400).json({ message: 'cannot create product' });
    }
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error uploading product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const { category, search } = req.query;
  try {
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for name
        { barcode: { $regex: search, $options: 'i' } }, // Case-insensitive partial match for barcode
      ];
    }

    if (category) {
      Object.assign(filter, { category }); // Exact match since it's an autocomplete value
    }
    const products = await Product.find(filter);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(400).json(error);
  }
};
export const getBestSellingProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().sort({ soldQty: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(400).json(error);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(400).json({ message: 'cannot find the product' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json(error);
  }
};
export const updateProductQuantityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { qty } = req.body;
    if (typeof qty !== 'number' || qty < 0) {
      res.status(400).json({ message: 'Invalid stock value' });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(400).json({ message: 'Cannot find product' });
      return;
    }

    if (product.stock < qty) {
      res.status(400).json({ message: 'product stock is lower than demand.' });
      return;
    } // Return null if stock is less than qty

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -qty, soldQty: qty } },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProductDetailsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pictures, stock, createdBy, ...data } = req.body;
    const product = await Product.findById(id);

    if (!createdBy) {
      res.status(200).json({ message: 'Unauthorized personnel.' });
      return;
    }
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Prepare updates
    const updateData = { ...data };
    if (createdBy) {
      updateData.updatedBy = createdBy; // Explicitly include createdBy
    }
    if (stock !== undefined) {
      const updateNumber = (product?.updatedCount.length || 0) + 1;
      const oldStock = product.stock || 0;
      const addedStock = stock - oldStock;
      const newUpdate = { updateNumber, oldStock, addedStock };
      updateData.stock = stock;
      updateData.$push = { updatedCount: newUpdate };
    }

    if (pictures === null || pictures === '') {
      updateData.pictures = null; // Explicitly clear the pictures field
    } else if (pictures && pictures.startsWith('data:image')) {
      const savedImage = await saveBase64Image(pictures, `product_${Date.now()}`);
      updateData.pictures = savedImage; // Update with the new image
    } else {
      updateData.pictures = pictures;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (updatedProduct) {
      res.status(200).json({ success: true, data: updatedProduct });
    }
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
