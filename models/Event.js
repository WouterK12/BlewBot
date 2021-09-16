const mongoose = require("mongoose");

const eventSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  channel: String,
  connected: Boolean,
  selfMute: Boolean,
  selfDeaf: Boolean,
  selfVideo: Boolean,
  speaking: Boolean,
  streaming: Boolean,
  time: String,
});

module.exports = mongoose.model("Event", eventSchema, "events");
