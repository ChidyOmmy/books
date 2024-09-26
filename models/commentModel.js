import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  text: { type: String, required: true, blank: false }
});

const Comment = model("Comment", commentSchema);
export default Comment;
