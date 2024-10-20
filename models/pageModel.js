import mongoose from "mongoose";

const { Schema, model } = mongoose;

const pageSchema = Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book" },
  content: { type: String }
});

const Page = model("Page", pageSchema);

export default Page;
