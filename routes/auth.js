import express from "express";
import bcrypt from "bcrypt";
const auth = express.Router();
import User from "../models/users.js";
const salt = 10;

auth.get("/register", (req, res) => {
  res.send({ message: "nigga it works" });
});

auth.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const requiredFields = username && password;
  if (!requiredFields) {
    return res.status(400).json({ message: "Fill in all required fields" });
  }
  // check if username exists
  if (username) {
    const usernameExists = await User.usernameExists(username);

    console.log(usernameExists);
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

export default auth;
