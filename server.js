import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authentication from "./routes/authentication.js";
import products from "./routes/products.js";
import orders from "./routes/orders.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error to Connected");
  });

app.use("/auth", authentication);
app.use("/products", products);
app.use("/orders", orders);

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
