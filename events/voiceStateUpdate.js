const { client } = require("../index");
const mongoose = require("mongoose");
const utils = require("../modules/utils");
const Event = require("../models/Event");
const User = require("../models/User");

client.on("voiceStateUpdate", async (guild, data) => {
  const user = await utils.GetUser(data.member);

  const newEvent = new Event({
    _id: mongoose.Types.ObjectId(),
    user: user._id,
    channel: data.channelID,
    connected: data.channelID ? true : false,
    selfMute: data.selfMute,
    selfDeaf: data.selfDeaf,
    selfVideo: data.selfVideo,
    speaking: data.speaking,
    streaming: data.streaming,
    time: Date.now(),
  });
  newEvent.save();
});
