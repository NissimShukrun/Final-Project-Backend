import { Router } from "express";
import Product from "../models/Product.js";
import User from "../models/User.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(400).send({ error: "products not found" });
    }
    res.status(200).send(products);
  } catch (err) {
    return res.status(500).send({ error: "server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(400).send({ error: "product not found" });
    }
    res.status(200).send(product);
  } catch (err) {
    return res.status(500).send({ error: "server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const newProduct = await Product.create({
      name,
      price,
      description,
    });
    res.status(201).send(newProduct);
  } catch (err) {
    return res.status(500).send({ error: "server error" });
  }
});

export default router;
