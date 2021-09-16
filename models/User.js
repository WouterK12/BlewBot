const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  name: String,
  time: String,
  updatedAt: String,
});

module.exports = mongoose.model("User", userSchema, "users");
