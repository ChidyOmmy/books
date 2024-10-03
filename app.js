import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { localDB, PORT } from "./config.js";
import auth from "./routes/auth.js";
import books from "./routes/books.js";
import User from "./models/userModel.js";
const app = express();

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(auth);
app.get("/", async (req, res) => {
  const users = await User.find().select("-password -__v");
  res.status(200).json({ users: users });
});
app.use(express.static("media"));
app.use("/books", books);

mongoose.connect(localDB).then(() => {
  console.log("Database successfully connected..");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
