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
    let { name, email, password } = req.body;
    const existingUser = await User.find({ email });
    if (existingUser.length > 0) {
      return res.status(403).send({ error: "email already exist" });
    }

    const saltRounds = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password,
    });

    const returnUser = {
      name: user.name,
      email: user.email,
      _id: user._id,
    };

    res.status(201).send({
      message: "User created succesfully",
      returnUser,
    });
  } catch (err) {
    return res.status(500).send({ error: "server error" });
  }
});

export default router;
