import { convertedDateEnd, convertedDateStart } from '../helpers';
import { Membership } from '../models/membership';
import { Order } from '../models/order';
import { Response, Request } from 'express';
import { Product } from '../models/products';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { items, profile, id, orderId, ...body } = req.body;
  try {
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
    if (id) {
      const member = await Membership.findById(id);
      if (member) {
        memberInfo = {
          type: member.type,
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
      member: memberInfo,
      createdBy: profile,
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
    const orders = await Order.find(filter);
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

    const order = await Order.find(query);
    if (order.length === 0) {
      res.status(400).json({ message: 'Order with this Purchased ID does not exist.' });
      return;
    }
    res.status(200).json({
      success: true,
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
