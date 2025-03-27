import { NextFunction, Request, Response } from 'express';

import { saveBase64Image } from '../helpers/file';
import { Product } from '../models/products';
import { User } from '../models/auth';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

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

    const productInfo = {
      name,
      price,
      importedPrice,
      pictures,
      stock,
      category,
      barcode,
      isActive,
      isDiscountable,
      updatedBy: admin._id,
      createdBy: admin._id,
    };

    const product = await Product.create(productInfo);

    if (!product) {
      res.status(400).json({ message: 'cannot create product' });
    }
    res.status(200).json({
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
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
    const products = await Product.find(filter).populate('createdBy').populate('updatedBy');

    res.status(200).json({ data: products });
  } catch (error) {
    next(error);
  }
};

export const getBestSellingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().sort({ soldQty: -1 });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(400).json({ message: 'cannot find the product' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProductQuantityById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

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

    const data = {
      updatedProduct,
      updatedBy: admin._id,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    next(error);
  }
};
export const updateCancelledProductQuantityById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

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

    // if (product.stock < qty) {
    //   res.status(400).json({ message: 'product stock is lower than demand.' });
    //   return;
    // } // Return null if stock is less than qty

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: qty, soldQty: -qty } },
      { new: true, runValidators: true },
    );

    const data = {
      updatedProduct,
      updatedBy: admin._id,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const updateProductDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }
    const { id } = req.params;
    const { pictures, stock, ...data } = req.body;
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Prepare updates
    const updateData = { ...data, updatedBy: admin._id };
    if (stock !== undefined) {
      const updateNumber = (product?.updatedCount.length || 0) + 1;
      const oldStock = product.stock || 0;

      if (stock > oldStock) {
        // Only update when stock increases
        const addedStock = stock - oldStock;
        const newUpdate = { updateNumber, oldStock, addedStock };

        updateData.stock = stock;
        updateData.$push = { updatedCount: newUpdate };
      } else {
        updateData.stock = stock; // Still update stock, but don't push to updatedCount
      }
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
      res.status(200).json({ data: updatedProduct });
      return;
    }
  } catch (error) {
    next(error);
  }
};
