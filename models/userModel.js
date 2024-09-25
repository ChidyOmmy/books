import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = Schema(
  {
    username: { type: String, required: true, lowercase: true },
    password: { type: String, required: true }
  },
  {
    statics: {
      usernameExists: function (username) {
        return this.findOne({ username: { $regex: username, $options: "i" } });
      }
    }
  }
);

const User = model("User", userSchema);

export default User;
