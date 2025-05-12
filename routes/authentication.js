import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = "1h";

// Create User

router.post("/register", async (req, res) => {
  try {
    const user = await User.create({
      name,
      email,
      password,
    });
    if (!user) {
      return res.status(400).send({ error: "failed create user" });
    }
  } catch (err) {}
});
