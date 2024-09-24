import express from "express";
import Book from "../models/bookModel.js";
import User from "../models/users.js";

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

    if (authors.constructor == Array) {
      authors.map(async (author) => {
        try {
          author = await User.findById(author);
          book.authors.push(author._id);
        } catch (error) {
          return res.status(404).json(error);
        }
      });
    } else {
      console.log(authors);
      try {
        const author = await User.findById(authors);
        console.log(author);
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
export default books;
