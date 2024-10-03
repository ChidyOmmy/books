import express from "express";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import actions from "./bookActions.js";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";

const books = express.Router();

// Set the storage engine
const storage = multer.diskStorage({
  destination: "./media",
  filename: function (req, file, cb) {
    cb(null, Date.now() + Math.random() + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10000000 },
  fileFilter: function (req, file, cb) {
    // Check the file type
    const filetypes = /jpeg|jpg|gif|png/;
    const extname = filetypes.test(path.extname(file.originalname));
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only");
    }
  }
}).single("cover");

books.get("/", async (req, res) => {
  let limit = parseInt(req.query.limit);
  let skip = parseInt(req.query.skip);
  if (limit < 1 || isNaN(limit)) limit = 3;
  if (isNaN(skip) || skip < 1) skip = 1;

  const booksCount = await Book.countDocuments({});
  const books = await Book.aggregate([
    { $match: {} },
    { $skip: (skip - 1) * 3 },
    {
      $project: {
        title: 1,
        authors: 1,
        cover: 1,
        likeCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" }
      }
    },
    {
      $sort: {
        likeCount: -1,
        commentsCount: -1
      }
    },
    { $limit: limit }
  ]);
  return res.status(200).json({ booksCount, books });
});

books.post("/create", upload, async (req, res) => {
  const { title, authorId } = req.body;
  const requiredFields = title && authorId;
  if (!req.file) return res.status(400).json({ error: "a cover is required" });
  if (!requiredFields) {
    return res.status(400).json({ error: "Fill alll the required fields" });
  }
  const cover = req.file.filename;
  const book = await Book.create({ title, cover });
  const author = await User.findById(authorId);

  if (book && author) {
    book.authors.push(author._id);
    await book.save();
    const newBook = await Book.findById(book._id).populate(
      "authors",
      "username _id"
    );
    return res.status(201).json({
      message: "Successfully created book",
      book: newBook
    });
  }
  return res
    .status(500)
    .json({ error: "Internal server error, Please try again" });
});

books.put("/add-authors", async (req, res) => {
  const { bookId, authors } = req.body;
  const requiredFields = bookId && authors;

  if (!requiredFields)
    return res.status(400).json({ error: "Fill in all required fields" });

  try {
    const book = await Book.findById(bookId);

    //   If authors is an array, proccess all in parallel
    if (authors.constructor == Array) {
      const authorsPromises = authors.map(async (authorId) => {
        const author = await User.findById(authorId);
        if (!author) throw new Error(`${authorID} not found`);
        return author._id;
      });
      const authorIds = await Promise.all(authorsPromises);
      book.authors.push(...authorIds);
    } else {
      try {
        const author = await User.findById(authors);
        book.authors.push(author._id);
      } catch (error) {
        return res.status(404).json({ error });
      }
    }
    try {
      await book.save();
      return res
        .status(201)
        .json({ message: "Successfully added more authors", book });
    } catch (error) {
      return res.status(500).json(error);
    }
  } catch (error) {
    return res.status(404).json(error);
  }
});
books.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const book = await Book.findById(id)
      .populate("authors comments", "username _id text")
      .exec();
    return res.status(200).json({ book });
  } catch (error) {
    return res.status(404).json({ error });
  }
});

books.use(actions);
export default books;
