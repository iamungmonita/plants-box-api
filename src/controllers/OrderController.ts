import { convertedDateEnd, convertedDateStart } from '../helpers';
import { Membership } from '../models/membership';
import { Order, OrderStatus, PaymentStatus } from '../models/order';
import { Response, Request, NextFunction } from 'express';
import { Product } from '../models/products';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { User } from '../models/auth';
import { updateCancelledProductQuantityById } from './ProductController';
import moment from 'moment';

const downloadsDir = path.join(__dirname, '../downloads');

if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { items, profile, phoneNumber, orderId, ...body } = req.body;
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'unauthorized personnel' });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'No order has been placed.' });
      return;
    }
    for (const item of items) {
      const { _id, quantity } = item;
      const product = await Product.findById(_id);
      if (!product) {
        res.status(404).json({ message: `Product with id ${_id} not found.` });
        return;
      }
      const stock = product.stock;
      if (quantity > stock) {
        res.status(400).json({
          message: `Not enough stock for product ${product.name}. Available: ${stock}, Requested: ${quantity}`,
        });
        return;
      }
    }
    let memberInfo = null;
    if (phoneNumber) {
      const member = await Membership.findOne({ phoneNumber: phoneNumber });
      if (member) {
        memberInfo = {
          type: member.type,
          points: member.points,
          phoneNumber: member.phoneNumber,
        };
      } else {
        res.status(404).json({ message: 'No member found.' });
        return;
      }
    }
    const order = await Order.create({
      orders: items,
      purchasedId: orderId,
      orderStatus: OrderStatus.COMPLETE,
      paymentStatus: PaymentStatus.COMPLETE,
      member: memberInfo,
      createdBy: admin._id,
      updatedBy: admin._id,
      ...body,
    });

    res.status(200).json({ data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  const { purchasedId, start, end } = req.query;
  const filter: any = {};

  if (purchasedId) {
    filter.purchasedId = { $regex: purchasedId, $options: 'i' };
  }

  if (start || end) {
    if (!start || !end) {
      res.status(400).json({ message: 'Both start and end dates are required' });
      return;
    }

    const parsedDateStart = new Date(start as string);
    const parsedDateEnd = new Date(end as string);

    if (isNaN(parsedDateStart.getTime()) || isNaN(parsedDateEnd.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    filter.createdAt = {
      $gte: convertedDateStart(parsedDateStart),
      $lte: convertedDateEnd(parsedDateEnd),
    };
  }

  try {
    const orders = await Order.find(filter).populate('createdBy');
    if (!orders) {
      res.status(400).json({ message: 'cannot fetch orders' });
      return;
    }
    const amount = orders.reduce((acc, order) => acc + order.totalAmount, 0);
    const data = {
      orders: orders,
      count: orders.length,
      amount: amount,
    };
    res.status(200).json({ data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const fetchOrderByToday = async (req: Request, res: Response): Promise<void> => {
  const { date } = req.query; // Expecting 'date' to be in ISO format (e.g., '2025-02-28T00:00:00.000Z')

  if (!date) {
    res.status(400).json({ message: 'Date parameter is required' });
    return;
  }

  try {
    // Parse the provided date (ISO string)
    const parsedDate = new Date(date as string);

    // Check if the date is valid
    if (isNaN(parsedDate.getTime())) {
      res.status(400).json({ message: 'Invalid date format' });
      return;
    }

    // Get the start of the day in UTC (midnight)
    const start = convertedDateStart(parsedDate);

    // Get the end of the day in UTC (11:59:59.999)
    const end = convertedDateEnd(parsedDate);

    // Find all orders created on the provided date
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

    res.status(200).json({ data });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPurchasedOrderByProductId = async (req: Request, res: Response): Promise<void> => {
  const { purchasedId } = req.params;

  try {
    const query: any = {};
    if (purchasedId) {
      query['purchasedId'] = { $regex: purchasedId, $options: 'i' };
    }

    const order = await Order.find(query).populate('createdBy');
    if (order.length === 0) {
      res.status(400).json({ message: 'Order with this Purchased ID does not exist.' });
      return;
    }
    res.status(200).json({
      message: 'An order matched this ID.',
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const fetchOrdersByRange = async (req: Request, res: Response): Promise<void> => {
  const { range } = req.query; // Expected values: "weekly", "monthly", "yearly"

  if (!range) {
    res.status(400).json({
      message: 'Range parameter is required (weekly, monthly, yearly)',
    });
    return;
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
    res.status(400).json({
      message: "Invalid range parameter. Use 'weekly', 'monthly', or 'yearly'.",
    });
    return;
  }

  try {
    const orders = await Order.find({
      createdAt: {
        $gte: convertedDateStart(startDate),
        $lte: convertedDateEnd(endDate),
      },
    });

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      range,
      count: orders.length,
      totalAmount,
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const downloadOrdersExcel = async (req: Request, res: Response) => {
  const { start, end } = req.query;

  try {
    const filter: any = {};

    if (start || end) {
      const parsedDateStart = start ? new Date(start as string) : new Date(0); // Defaults to 1970-01-01
      const parsedDateEnd = end ? new Date(end as string) : new Date();
      if (isNaN(parsedDateStart.getTime()) && isNaN(parsedDateEnd.getTime())) {
        res.status(400).json({ message: 'Invalid date format' });
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
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
};

export const cancelOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'Unauthorized personnel' });
      return;
    }

    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      res.status(400).json({ message: 'Cannot find order' });
      return;
    }

    await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          totalAmount: 0,
          orderStatus: OrderStatus.CANCELLED,
          paymentStatus: PaymentStatus.CANCELLED,
          updatedBy: admin._id,
        },
      },
      { new: true, runValidators: true },
    );
    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

export const retrieveOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const admin = await User.findById(req.admin);
    if (!admin) {
      res.status(401).json({ message: 'Unauthorized personnel' });
      return;
    }

    const { id } = req.params;
    const { total } = req.body;
    console.log(id, total);
    const order = await Order.findById(id);
    if (!order) {
      res.status(400).json({ message: 'Cannot find order' });
      return;
    }

    await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          totalAmount: total,
          orderStatus: OrderStatus.COMPLETE,
          paymentStatus: PaymentStatus.COMPLETE,
          updatedBy: admin._id,
        },
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({ message: 'Order retrieved successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMonthlySale = async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json({ data: formattedSales });
  } catch (error: any) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error: error.message });
  }
};
