import { convertedDateEnd, convertedDateStart } from '../helpers';
import { Membership } from '../models/membership';
import { Order, OrderStatus, PaymentStatus } from '../models/order';
import { Response, Request, NextFunction } from 'express';
import { Product } from '../models/products';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { BadRequestError, MissingParamError, NotFoundError } from '../libs/exceptions';
import mongoose from 'mongoose';

const downloadsDir = path.join(__dirname, '../downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { items, profile, phoneNumber, orderId, ...body } = req.body;
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('No order has been placed.');
    }
    for (const item of items) {
      const { _id, quantity } = item;
      const product = await Product.findOne({ _id: _id, isActive: true });
      if (!product) {
        throw new NotFoundError(`Product with ID: ${_id} not found.`);
      }
      const stock = product.stock;
      if (quantity > stock) {
        throw new BadRequestError(
          `Not enough stock for product ${product.name}. Available: ${stock}, Requested: ${quantity}`,
        );
      }
    }

    let memberInfo = null;
    if (phoneNumber) {
      const member = await Membership.findOne({ phoneNumber, isActive: true });
      if (!member) {
        throw new NotFoundError('No membership found.');
      }
      memberInfo = {
        type: member.type,
        points: member.points,
        phoneNumber: member.phoneNumber,
      };
    }
    const order = await Order.create({
      orders: items,
      purchasedId: orderId,
      orderStatus: OrderStatus.COMPLETE,
      paymentStatus: PaymentStatus.COMPLETE,
      member: memberInfo,
      createdBy: req.admin,
      updatedBy: req.admin,
      ...body,
    });
    res.status(200).json({ data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { purchasedId, start, end } = req.query;
  const filter: any = {};

  if (purchasedId) {
    filter.purchasedId = { $regex: purchasedId, $options: 'i' };
  }

  if (start || end) {
    const parsedDateStart = start ? new Date(start as string) : new Date(0); // Defaults to 1970-01-01
    const parsedDateEnd = end ? new Date(end as string) : new Date();

    if (isNaN(parsedDateStart.getTime()) || isNaN(parsedDateEnd.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    if (start && end) {
      filter.createdAt = {
        $gte: convertedDateStart(parsedDateStart),
        $lte: convertedDateEnd(parsedDateEnd),
      };
    } else if (start) {
      filter.createdAt = {
        $gte: convertedDateStart(parsedDateStart),
      };
    } else if (end) {
      filter.createdAt = {
        $lte: convertedDateEnd(parsedDateEnd),
      };
    }
  }

  try {
    const orders = await Order.find(filter).populate('createdBy');
    const amount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const data = {
      orders: orders,
      count: orders.length,
      amount: amount,
    };
    res.json({ data: data });
  } catch (error) {
    next(error);
  }
};

export const getOrderToday = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { date } = req.query;
  try {
    if (!date) {
      throw new MissingParamError('date');
    }

    const parsedDate = new Date(date as string);
    if (isNaN(parsedDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }
    const start = convertedDateStart(parsedDate);
    const end = convertedDateEnd(parsedDate);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end }, // Filter by createdAt
    });

    const count = orders.length;
    const amount = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const data = {
      orders,
      amount,
      count,
    };

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

export const getPurchasedOrderByProductId = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { purchasedId } = req.params;

  try {
    const query: any = {};
    if (purchasedId) {
      query['purchasedId'] = { $regex: purchasedId, $options: 'i' };
    }
    const order = await Order.find(query).populate('createdBy');
    if (order.length === 0) {
      throw new NotFoundError('Order with this Purchased ID does not exist.');
    }
    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrderByRange = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { range } = req.query;
  try {
    if (!range) {
      throw new MissingParamError('range');
    }

    let startDate: Date;
    let endDate: Date = new Date(); // Current date as the end date

    const today = new Date();

    if (range === 'weekly') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // Last 7 days
    } else if (range === 'monthly') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Start of the current month
    } else if (range === 'yearly') {
      startDate = new Date(today.getFullYear(), 0, 1); // Start of the current year
    } else {
      throw new BadRequestError('Invalid range parameter. Use weekly, monthly, or yearly');
    }

    const orders = await Order.find({
      createdAt: {
        $gte: convertedDateStart(startDate),
        $lte: convertedDateEnd(endDate),
      },
    });

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      range,
      count: orders.length,
      totalAmount,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadOrdersExcel = async (req: Request, res: Response, next: NextFunction) => {
  const { start, end } = req.query;

  try {
    const filter: any = {};

    if (start || end) {
      const parsedDateStart = start ? new Date(start as string) : new Date(0); // Defaults to 1970-01-01
      const parsedDateEnd = end ? new Date(end as string) : new Date();
      if (isNaN(parsedDateStart.getTime()) && isNaN(parsedDateEnd.getTime())) {
        throw new BadRequestError('Invalid date format');
        return;
      }
      if (start && end) {
        filter.createdAt = {
          $gte: convertedDateStart(parsedDateStart),
          $lte: convertedDateEnd(parsedDateEnd),
        };
      } else if (start) {
        filter.createdAt = {
          $gte: convertedDateStart(parsedDateStart),
        };
      } else if (end) {
        filter.createdAt = {
          $lte: convertedDateEnd(parsedDateEnd),
        };
      }
    }

    const orders = await Order.find(filter); // Fetch all orders

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    // Define columns
    worksheet.columns = [
      { header: 'Purchase ID', key: 'purchasedId', width: 20 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'Total Amount', key: 'totalAmount', width: 15 },
      { header: 'Paid Amount', key: 'paidAmount', width: 15 },
      { header: 'Change Amount', key: 'changeAmount', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 20 },
      { header: 'Date', key: 'createdAt', width: 20 },
    ];

    // Add rows
    orders.forEach((order) => {
      worksheet.addRow({
        purchasedId: order.purchasedId,
        paymentMethod: order.paymentMethod,
        totalAmount: order.totalAmount,
        paidAmount: order.paidAmount,
        changeAmount: order.changeAmount,
        createdBy: order.createdBy,
        createdAt: new Date(order.createdAt).toLocaleString(),
      });
    });

    // Save file temporarily
    const filePath = path.join(__dirname, '../downloads/orders.xlsx');
    await workbook.xlsx.writeFile(filePath);

    // Send file to client
    res.download(filePath, 'orders.xlsx', (err) => {
      if (err) console.error('File download error:', err);
      fs.unlinkSync(filePath); // Delete after sending
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrderById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const order = await Order.findOne({ _id: id });
    if (!order) {
      throw new NotFoundError('Admin does not exist.');
    }

    await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          totalAmount: 0,
          orderStatus: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.CANCELLED,
          updatedBy: req.admin,
        },
      },
      { new: true, runValidators: true },
    );
    res.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateOrderById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { total } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid ID format');
    }
    const order = await Order.findOne({ _id: id });
    if (!order) {
      throw new NotFoundError('Order does not exist.');
    }

    await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          totalAmount: total,
          orderStatus: OrderStatus.COMPLETE,
          paymentStatus: PaymentStatus.COMPLETE,
          updatedBy: req.admin,
        },
      },
      { new: true, runValidators: true },
    );

    res.json({ message: 'Order retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySale = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sales = await Order.aggregate([
      {
        $addFields: {
          localMonth: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } }, // Extract month and year from Date object
        },
      },
      {
        $group: {
          _id: '$localMonth',
          totalSale: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedSales = sales.map((sale) => ({
      month: moment(sale._id, 'YYYY-MM').format('MMM'), // Format as "Jan", "Feb", "Mar" (without year)
      sale: sale.totalSale,
    }));

    res.json({ data: formattedSales });
  } catch (error: any) {
    next(error);
  }
};
