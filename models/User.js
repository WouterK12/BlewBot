const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: String,
  name: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  time: String,
  updatedAt: String,
});

module.exports = mongoose.model("User", userSchema, "users");
