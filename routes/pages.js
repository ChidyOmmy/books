import express from "express";
import Page from "../models/pageModel.js";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

import { verifyAccesskey } from "../middleware/accessKeyVerify.js";

const pages = express.Router();

pages.post("/create-page", async (req, res) => {
  const { bookId, content } = req.body;
  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).json({ error: "Invalid ID for book" });
  const book = await Book.findById(bookId);
  if (book) {
    const page = await Page.create({ book, content });
    const allPages = await Page.find();
    return res.status(201).json({ message: "page created", page, allPages });
  }
  return res.status(404).json({ error: "Book not found" });
});

pages.get("/:id/pages", async (req, res) => {
  const id = req.params.id;
  const skip = parseInt(req.query.skip);
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ error: "Invalid ID for book" });
  const book = await Book.findById(id);
  const pageCount = await Page.countDocuments({ book: book._id });
  const pages = await Page.aggregate([
    { $match: { book: book._id } },
    { $project: { content: 1 } },
    { $skip: skip },
    { $limit: 4 }
  ]);
  if (pages) return res.status(200).json({ pages, pageCount });
  return res.status(404).json({ error: "Pages not found" });
});
pages.put("/update-page", async (req, res) => {
  const { pageId, content } = req.body;

  if (!mongoose.isValidObjectId(pageId))
    return res.status(400).json({ error: "Invalid ID for page" });

  const page = await Page.findById(pageId);

  if (page) {
    page.content = content;
    page.save();
    return res
      .status(200)
      .json({ message: "Successfully updated the page", page });
  }
  return res.status(404).json({ error: "Page not found" });
});

pages.delete("/delete-page", async (req, res) => {
  const { pageId } = req.body;

  if (!mongoose.isValidObjectId(pageId))
    return res.status(400).json({ error: "Invalid ID for page" });

  const page = await Page.findById(pageId);
  const deleted = await Page.deleteOne({ _id: page._id });
  return res.status(200).json({ deleted });
});
export default pages;
