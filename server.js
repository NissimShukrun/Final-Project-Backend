import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authentication from "./routes/authentication.js";
import products from "./routes/products.js";

const app = express();
dotenv.config();

app.use(express.json());

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

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:5000`);
});
