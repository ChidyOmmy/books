import express from "express";
import mongoose from "mongoose";
import { localDB, PORT } from "./config.js";
import auth from "./routes/auth.js";
import books from "./routes/books.js";
import User from "./models/userModel.js";
const app = express();

app.use(express.json());

app.use(auth);

app.get("/", async (req, res) => {
  const users = await User.find().select("-password -__v");
  res.status(200).json({ users: users });
});

app.use("/books", books);

mongoose.connect(localDB).then(() => {
  console.log("Database successfully connected..");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
