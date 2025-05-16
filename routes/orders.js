import { Router } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { verifyAuth, checkRole } from "../middlewares/verify.js";

const router = Router();

router.get("/", verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ customer: userId }).populate(
      "items.product",
      "name price"
    );

    res.status(200).send(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

router.get("/all", verifyAuth, checkRole(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate("items.product", "name price");

    res.status(200).send(orders);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

router.post("/", verifyAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).send({ error: "No order items" });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).send({ error: "Product not found" });
      }

      if (item.quantity <= 0) {
        return res.status(400).send({ error: "Quantity must be positive" });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
      });

      totalPrice += product.price * item.quantity;
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalPrice,
    });

    res.status(201).send(order);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
});

export default router;
