import express from "express";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import Comment from "../models/commentModel.js";
import mongoose from "mongoose";

const actions = express.Router();

actions.post("/:id/like", async (req, res) => {
  const bookId = req.params.id;
  const { userId } = req.body;
  if (!(userId && bookId))
    return res.status(400).json({ error: "Fill in all required fields" });
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ error: "Invalid ObjectId for User" });
  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).json({ error: "Invalid ObjectId for Book" });
  const book = await Book.findById(bookId);
  const user = await User.findById(userId);
  if (!(book && user))
    return res.status(404).json({ error: "Not found, try again" });
  let message;
  if (!book.likes.includes(user._id)) {
    message = "added to liked books";
    book.likes.push(user._id);
    user.likedBooks.push(book._id);
  } else {
    message = "removed from liked books";
    book.likes = book.likes.filter(
      (id) => id.toString() !== user._id.toString()
    );
    user.likedBooks = user.likedBooks = user.likedBooks.filter(
      (id) => id.toString() !== book._id.toString()
    );
  }

  try {
    book.save();
    user.save();
    return res.status(201).json({ message, book });
  } catch (error) {
    res.status(500).json(error);
  }
});

actions.post("/:id/favorite", async (req, res) => {
  const bookId = req.params.id;
  const { userId } = req.body;
  if (!(userId && bookId))
    return res.status(400).json({ error: "Fill in all required fields" });
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ error: "Invalid ObjectId for User" });
  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).json({ error: "Invalid ObjectId for Book" });
  const book = await Book.findById(bookId);
  const user = await User.findById(userId).select("-password");
  if (!(book && user))
    return res.status(404).json({ error: "Not found, try again" });
  let message;
  if (!user.favorites.includes(book._id)) {
    message = "added  book to favorites";
    user.favorites.push(book._id);
  } else {
    message = "removed book from favorites";
    user.favorites = user.favorites.filter(
      (id) => id.toString() !== book._id.toString()
    );
  }

  try {
    user.save();
    return res.status(201).json({ message, user });
  } catch (error) {
    res.status(500).json(error);
  }
});

actions.post("/:id/comment", async (req, res) => {
  const bookId = req.params.id;
  const { userId, text } = req.body;
  if (!(userId && text && bookId))
    return res.status(400).json({ error: "Fill in all required fields" });
  if (!mongoose.isValidObjectId(userId))
    return res.status(400).json({ error: "Invalid ObjectId for User" });
  if (!mongoose.isValidObjectId(bookId))
    return res.status(400).json({ error: "Invalid ObjectId for Book" });
  const book = await Book.findById(bookId);
  const user = await User.findById(userId).select("-password");
  if (!(book && user))
    return res.status(404).json({ error: "Not found, try again" });
  const comment = await Comment.create({
    user: user._id,
    book: book._id,
    text
  });
  if (!comment)
    return res.status(500).json({ error: "an error occured, Try again." });
  try {
    await comment.save();
    book.comments.push(comment._id);
    await book.save();
    return res.status(201).json({ message: "comment added to book", comment });
  } catch (error) {
    res.status(500).json(error);
  }
});

export default actions;
