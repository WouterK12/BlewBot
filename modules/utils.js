const mongoose = require("mongoose");
const User = require("../models/User");

module.exports = {
  async GetUser(member) {
    let user = await User.findOne({ userId: member.id });
    if (user) return user;

    const newUser = new User({
      _id: mongoose.Types.ObjectId(),
      userId: member.id,
      name: member.user.username,
      time: Date.now(),
      updatedAt: Date.now(),
    });
    return await newUser.save();
  },
};
