import { NextFunction, Request, Response } from 'express';
import { saveBase64Image } from '../helpers/file';
import { Product } from '../models/products';
import { BadRequestError, MissingParamError, NotFoundError } from '../libs/exceptions';
import mongoose from 'mongoose';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
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
    if (!name) throw new MissingParamError('name');
    if (!price) throw new MissingParamError('price');
    if (!importedPrice) throw new MissingParamError('importedPrice');
    if (!stock) throw new MissingParamError('stock');
    if (!category) throw new MissingParamError('category');
    if (!isDiscountable) throw new MissingParamError('isDiscountable');
    if (!isActive) throw new MissingParamError('isActive');
    if (!barcode) throw new MissingParamError('barcode');

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
      updatedBy: req.admin,
      createdBy: req.admin,
    };

    const product = await Product.create(productInfo);

    res.json({ data: product });
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
    const products = await Product.find(filter)
      .populate('createdBy')
      .populate('updatedBy')
      .sort({ createdAt: -1 });
    res.status(200).json({ data: products });
  } catch (error) {
    next(error);
  }
};

export const getBestSellingProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find().sort({ soldQty: -1, createdAt: -1 });

    res.status(200).json({ data: products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const product = await Product.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundError('Product does not exist.');
    }
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const updateProductQuantityById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { qty } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    if (typeof qty !== 'number' || qty < 0) {
      throw new BadRequestError('Invalid stock value');
    }
    const product = await Product.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundError('Product does not exist.');
    }

    if (product.stock < qty) {
      throw new BadRequestError('Product stock is lower than demand.');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -qty, soldQty: qty } },
      { new: true, runValidators: true },
    );

    const data = {
      updatedProduct,
      updatedBy: req.admin,
    };

    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const updateCancelledProductQuantityById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id } = req.params;
  const { qty } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }

    if (typeof qty !== 'number' || qty < 0) {
      throw new BadRequestError('Invalid stock value');
    }
    const product = await Product.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundError('Product does not exist.');
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: qty, soldQty: -qty } },
      { new: true, runValidators: true },
    );

    const data = {
      updatedProduct,
      updatedBy: req.admin,
    };

    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const updateProductDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { pictures, stock, ...data } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const product = await Product.findOne({ _id: id, isActive: true });
    if (!product) {
      throw new NotFoundError('Product does not exist.');
    }

    const updateData = { ...data, updatedBy: req.admin };
    if (stock !== undefined) {
      const updateNumber = (product?.updatedCount.length || 0) + 1;
      const oldStock = product.stock || 0;

      if (stock > oldStock) {
        const addedStock = stock - oldStock;
        const newUpdate = { updateNumber, oldStock, addedStock };

        updateData.stock = stock;
        updateData.$push = { updatedCount: newUpdate };
      } else {
        updateData.stock = stock;
      }
    }

    if (pictures === null || pictures === '') {
      updateData.pictures = null;
    } else if (pictures && pictures.startsWith('data:image')) {
      const savedImage = await saveBase64Image(pictures, `product_${Date.now()}`);
      updateData.pictures = savedImage;
    } else {
      updateData.pictures = pictures;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    if (updatedProduct) {
      res.json({ data: updatedProduct });
      return;
    }
  } catch (error) {
    next(error);
  }
};
