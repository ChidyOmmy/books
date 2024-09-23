import express from "express";
import mongoose from "mongoose";
import { localDB, PORT } from "./config.js";
import auth from "./routes/auth.js";

const app = express();

app.use(express.json());

app.use(auth);

app.get("/", (req, res) => {
  res.send({ message: "Hello world" });
});

mongoose.connect(localDB).then(() => {
  console.log("Databse successfully connected..");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
