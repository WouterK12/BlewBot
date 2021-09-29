const { client } = require("../index");
const axios = require("axios");
const User = require("../models/User");

module.exports = {
  name: "updateavatars",
  aliases: ["ua"],
  guildOnly: true,
  cooldown: 30,
  description:
    "Sometimes someone changes their profile picture. Use this command to update the database.",

  async execute(message, args) {
    let msg = await message.channel.send(
      "💾  Updating all profile pictures..."
    );

    const members = await message.guild.members.cache;

    members.forEach((member) => {
      console.log(member.user.id);
      User.updateOne(
        { userId: member.user.id },
        { avatar: member.user.avatarURL() },
        (err, user) => {
          console.log(user);
          if (err) {
            return msg.edit(
              "❌  Whoops! Something went wrong!\nTry again later."
            );
          }
        }
      );
    });

    return msg.edit(
      "✅  Successfully updated all profile pictures in the database."
    );
  },
};
