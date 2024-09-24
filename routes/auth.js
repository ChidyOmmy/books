import express from "express";
import bcrypt from "bcrypt";
import User from "../models/users.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY, REFRESH_SECRET_KEY } from "../config.js";
import { verifyAccesskey } from "../middleware/accessKeyVerify.js";

const salt = 10;
const auth = express.Router();

auth.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const requiredFields = username && password;
  if (!requiredFields) {
    return res.status(400).json({ message: "Fill in all required fields" });
  }
  // check if username exists
  if (username) {
    const usernameExists = await User.usernameExists(username.toLowerCase());

    if (usernameExists) {
      return res
        .status(400)
        .json({ error: `username ${username} already exist` });
    }
  }

  // Hash password
  bcrypt.hash(password, salt, async (err, hash) => {
    await User.create({ username, password: hash })
      .then((user) => {
        res.status(201).json(user);
        console.log(`Successfully created a new user ${user}`);
      })
      .catch((err) => {
        return res.status(400).json({ error: err });
      });
  });
});

auth.post("/login", async (req, res) => {
  // Get all required fields
  const { username, password } = req.body;
  const requiredFields = username && password;
  if (!requiredFields) {
    return res.status(400).json({ message: "Fill in all required fields" });
  }
  // Find User
  const user = await User.findOne({ username: username.toLowerCase() });
  if (user) {
    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.user = user;
      // generate auth tokens
      const payload = { username };
      const options = {};
      const access = await jwt.sign(payload, SECRET_KEY, options);
      const refresh = await jwt.sign(payload, REFRESH_SECRET_KEY, options);
      return res.status(200).json({ message: "Logged in", access, refresh });
    } else {
      req.user = null;
      return res.status(403).json({ error: "Incorrect password" });
    }
  }
  return res
    .status(400)
    .json({ error: `Invalid user with username ${username}` });
});

auth.get("/restricted", verifyAccesskey, (req, res) => {
  res.json({ user: req.user });
});
export default auth;
