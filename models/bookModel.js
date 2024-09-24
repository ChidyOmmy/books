import mongoose from "mongoose";

const { Schema, model } = mongoose;

const bookSchema = Schema({
  title: { type: String, required: true, blank: false },
  authors: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

const Book = model("Book", bookSchema);

export default Book;
