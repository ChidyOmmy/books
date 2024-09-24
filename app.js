import express from "express";
import mongoose from "mongoose";
import { localDB, PORT } from "./config.js";
import auth from "./routes/auth.js";
import User from "./models/users.js";
const app = express();

app.use(express.json());

app.use(auth);

app.get("/", async (req, res) => {
  const users = await User.find({});
  res.status(200).json({ users: users });
});

mongoose.connect(localDB).then(() => {
  console.log("Databse successfully connected..");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
