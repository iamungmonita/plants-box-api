import { Order } from "../models/order";
import { Response, Request } from "express";

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    orders,
    amount,
    paymentMethod,
    profile,
    discount,
    discountedAmount,
    calculatedDiscount,
    vatAmount,
    totalAmount,
  } = req.body;
  try {
    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      res.status(400).json({ message: "no order has been placed" });
      return;
    }

    const generatePurchaseId = async () => {
      const lastOrder = await Order.findOne().sort({ createdAt: -1 });
      const lastNumber =
        lastOrder && lastOrder.purchasedId
          ? parseInt(lastOrder.purchasedId.split("-")[1])
          : 0;
      const newNumber = (lastNumber + 1).toString().padStart(5, "0"); // Ensure 5-digit format
      return `PO-${newNumber}`;
    };
    const createOrder = await Order.create({
      orders,
      discountedAmount,
      calculatedDiscount,
      vatAmount,
      totalAmount,
      paymentMethod,
      purchasedId: await generatePurchaseId(),
      amount,
      discount,
      createdBy: profile,
    });
    res.status(200).json(createOrder);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
};

export const retrieve = async (req: Request, res: Response): Promise<void> => {
  const { purchaseId } = req.query;
  const query = Object.assign(
    {},
    purchaseId ? { purchasedId: purchaseId } : {}
  );

  try {
    const orders = await Order.find(query);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
const fetchOrderById = async (id: string) => {
  const orders = await Order.find();
  return orders.filter(
    (order) => order.orders.some((o) => o._id.toString() === id) // Convert ObjectId to string
  );
};

export const getPurchasedOrderByProductId = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { purchasedId } = req.query;
  try {
    const query: any = {};

    if (id) {
      query["orders"] = { $elemMatch: { _id: id } }; // Check inside orders array
    }

    if (purchasedId) {
      query["purchasedId"] = { $regex: purchasedId, $options: "i" };
    }

    const result = await Order.find(query);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
