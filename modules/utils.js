const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = {
  async GetUser(member) {
    let user = await User.findOne({ userId: member.id }).populate("events");
    if (user) return user;

    const newUser = new User({
      _id: mongoose.Types.ObjectId(),
      userId: member.id,
      name: member.user.username,
      avatar: member.user.avatarURL(),
      time: Date.now(),
      updatedAt: Date.now(),
    });
    return await newUser.save();
  },
};
