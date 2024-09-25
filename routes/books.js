import express from "express";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";

const books = express.Router();

books.get("/", async (req, res) => {
  const books = await Book.find();
  res.status(200).json({ books });
});

books.post("/create", async (req, res) => {
  const { title, authorId } = req.body;
  const requiredFields = title && authorId;

  if (!requiredFields) {
    return res.status(400).json({ error: "Fill alll the required fields" });
  }

  const book = await Book.create({ title });
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
      .populate("authors", "username _id")
      .exec();
    console.log(book.authors);
    return res.status(200).json({ book });
  } catch (error) {
    return res.status(404).json({ error });
  }
});
export default books;
