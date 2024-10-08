import express from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { SECRET_KEY, REFRESH_SECRET_KEY } from "../config.js";
import { verifyAccesskey } from "../middleware/accessKeyVerify.js";

const salt = 10;
const auth = express.Router();

auth.get("/usernamecheck/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const usernameExists = await User.usernameExists(username);
    if (usernameExists) {
      res.status(200).json({ available: true });
    } else {
      res.status(200).json({ available: false });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

auth.post("/register", async (req, res) => {
  const { username, password, fullname } = req.body;
  const requiredFields = username && password && fullname;
  if (!requiredFields) {
    return res.status(400).json({ error: "Fill in all required fields" });
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
    await User.create({ username, fullname, password: hash })
      .then(async (user) => {
        // generate auth tokens
        const payload = { id: user._id, username: user.username };
        const accessOptions = { expiresIn: "2m" };
        const refreshOptions = { expiresIn: "1days" };
        const access = await jwt.sign(payload, SECRET_KEY, accessOptions);
        const refresh = await jwt.sign(
          payload,
          REFRESH_SECRET_KEY,
          refreshOptions
        );
        res.status(201).json({
          user: {
            fullname: user.fullname,
            username: user.username,
            id: user._id,
            access,
            refresh
          }
        });
        console.log(`Successfully created a new user ${user.username}`);
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({ error: `Internal server error` });
        // logg the error
      });
  });
});

auth.post("/login", async (req, res) => {
  // Get all required fields
  const { username, password } = req.body;
  const requiredFields = username && password;
  if (!requiredFields) {
    return res.status(400).json({ error: "Fill in all required fields" });
  }
  // Find User
  const user = await User.findOne({ username: username.toLowerCase() });
  if (user) {
    // compare password
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.user = user;
      // generate auth tokens
      const payload = { id: user._id, username: user.username };
      const accessOptions = { expiresIn: "40s" };
      const refreshOptions = { expiresIn: "60s" };
      const access = await jwt.sign(payload, SECRET_KEY, accessOptions);
      const refresh = await jwt.sign(
        payload,
        REFRESH_SECRET_KEY,
        refreshOptions
      );
      return res.status(200).json({
        message: "Logged in",
        user: {...payload,fullname:user.fullname,access, refresh},
      });
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

auth.get("/refresh", async (req, res) => {
  const authHeaders = req.headers.authorization;
  const options = {};
  if (!authHeaders) {
    return res.status(403).json({ error: "Authorization headers required" });
  }
  // Get Refresh token from auth headers using Bearer 'token' format
  const refresh = authHeaders.split(" ")[1];
  if (!refresh) {
    return res.status(403).json({ error: "refresh token required" });
  }
  jwt.verify(refresh, REFRESH_SECRET_KEY, options, async (err, decode) => {
    if (err) {
      return res.status(403).json({ error: err });
    } else {
      const payload = { username: decode.username, id: decode.id };
      const accessOptions = { expiresIn: "2m" };
      const refreshOptions = { expiresIn: "1days" };
      const access = await jwt.sign(payload, SECRET_KEY, accessOptions);
      const refresh = await jwt.sign(
        payload,
        REFRESH_SECRET_KEY,
        refreshOptions
      );
      return res.status(201).json({
        user: { id: decode.id, username: decode.username },
        access,
        refresh
      });
    }
  });
});
export default auth;
