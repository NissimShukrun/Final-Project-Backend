import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { serialize } from "cookie";

dotenv.config();

const router = Router();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = "1h";

// Register User

router.post("/register", async (req, res) => {
  try {
    let { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(403).send({ error: "Email already exists" });
    }

    const saltRounds = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      name,
      email,
      password,
      isAdmin: "user",
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

// Login User

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Invalid password or email" });
    }

    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiration }, (err, token) => {
      if (err) {
        console.log("failed to create token", err);
        return res.status(500).send({ error: "server error" });
      }

      const serialized = serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
      res.setHeader("Set-Cookie", serialized);

      const returnUser = {
        name: user.name,
        email: user.email,
        _id: user._id,
        isAdmin: user.isAdmin,
      };

      const message =
        user.isAdmin === "admin"
          ? "Admin logged in successfully"
          : "User logged in succesfully";

      res.status(200).send({
        message,
        user: returnUser,
        token: token,
      });
    });
  } catch (err) {
    console.log("failed login", err);
    return res.status(500).send({ error: "server error" });
  }
});

////

router.post("/logout", async (req, res) => {
  const serialized = serialize("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });

  res.setHeader("Set-Cookie", serialized);
  return res.status(200).json({ message: "Logged out successfully" });
});

////

router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).send({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.status(200).send({
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
      isAdmin: decoded.isAdmin,
    });
  } catch (err) {
    return res.status(403).send({ error: "Invalid token" });
  }
});

export default router;
