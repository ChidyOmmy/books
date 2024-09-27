import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = Schema({
  title: { type: String, required: true, blank: false },
  cover: { type: String, default: "defaultCover.png" },
  authors: [{ type: Schema.Types.ObjectId, ref: "User" }],
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
});

const Book = model("Book", bookSchema);

export default Book;
