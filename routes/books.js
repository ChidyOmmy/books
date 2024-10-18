import express from "express";
import Book from "../models/bookModel.js";
import User from "../models/userModel.js";
import actions from "./bookActions.js";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import { verifyAccesskey } from "../middleware/accessKeyVerify.js";

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
  let user = req.query.user;
  if (limit < 1 || isNaN(limit)) limit = 3;
  if (isNaN(skip) || skip < 1) skip = 1;
  let favorites = [];

  if (mongoose.isValidObjectId(user)) {
    user = await User.findById(user);
    if (user) {
      favorites = user.favorites;
      user = user._id;
    }
  }
  const booksCount = await Book.countDocuments({});
  const popularBooks = await Book.aggregate([
    { $match: {} },
    {
      $project: {
        title: 1,
        authors: 1,
        cover: 1,
        likeCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        userLiked: { $in: [user, "$likes"] },
        inFavorite: { $in: ["$_id", favorites] }
      }
    },
    { $sort: { likeCount: -1, commentsCount: -1 } },
    { $limit: 2 }
  ]);
  const books = await Book.aggregate([
    { $match: {} },
    { $skip: (skip - 1) * 3 },
    {
      $project: {
        title: 1,
        authors: 1,
        cover: 1,
        likeCount: { $size: "$likes" },
        commentsCount: { $size: "$comments" },
        userLiked: { $in: [user, "$likes"] },
        inFavorite: { $in: ["$_id", favorites] }
      }
    },
    { $limit: limit }
  ]);
  return res.status(200).json({ booksCount, books, popularBooks });
});

books.post("/create", verifyAccesskey, upload, async (req, res) => {
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
        if(book.authors.includes(author._id)) throw new Error(`${author.username} is already an author`)
        return author._id;
      });
      const authorIds = await Promise.all(authorsPromises);
      book.authors.push(...authorIds);
    } 
    else {
      try {
        const author = await User.findById(authors);
        book.authors.push(author._id);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    try {
      await book.save();
      return res
        .status(201)
        .json({ message: "Successfully added more authors", book });
    } catch (error) {
      return res.status(500).json({error: error.message});
    }
  } catch (error) {
    return res.status(400).json({error: error.message});
  }
});

books.put('/update-book',upload, async(req,res)=>{
  const {title, subtitle, summary, bookId} = req.body
  const authors = JSON.parse(req.body.authors)
  
   if (!mongoose.isValidObjectId(bookId))
    return res.status(400).json({ error: "Invalid ObjectId for Book" });
  const book = await Book.findById(bookId)

  if(!book) return res.status(404).json({error: 'Book not found, It might have been deleted'})
  if(title) book.title = title
  if(subtitle) book.subtitle = subtitle
  if(summary) book.summary = summary
  if(req.file) book.cover = req.file.filename

  // adding authors 

  if(authors.length > 0){
     if (authors.constructor == Array) {
      const authorsPromises = authors.map(async (authorId) => {
        if (!mongoose.isValidObjectId(authorId)) throw new Error(`Invalid ObjectId for user ${authorId} in array of authors`)
        const author = await User.findById(authorId);
        if (!author) throw new Error(`${authorID} not found`);
        if(book.authors.includes(author._id)) throw new Error(`${author.username} is already an author`)
        return author._id;
      });
      const authorIds = await Promise.all(authorsPromises);
      book.authors.push(...authorIds);
    } else {
      try {
        if (!mongoose.isValidObjectId(authors)) throw new Error(`Invalid ObjectId for user ${authors}`)
        const author = await User.findById(authors);
        book.authors.push(author._id);
      } catch (error) {
        return res.status(500).json({ error: error.message });
      }
    }
    
    // end of add authors
  }
  
   try {
    await book.save()
     const updatedBook = await Book.findById(book._id)
      .populate("authors comments", "username _id text")
      .exec();
    return res.status(200).json({message: 'Successfully updated book', book: updatedBook})
   } catch (error) {
    return res.status(500).json({error: error.message})
   }})

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
