const { client } = require("../index");
const axios = require("axios");
const User = require("../models/User");

const errorMessage = "❌  Whoops! Something went wrong!\nTry again later.";

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

    // const members = await message.guild.members.cache;
    const members = message.guild.members
      .fetch()
      .then((members) => {
        members.forEach((member) => {
          User.updateOne(
            { userId: member.user.id },
            { avatar: member.user.avatarURL() },
            (err, user) => {
              if (err) {
                console.log(err);
                return msg.edit(errorMessage);
              }
            }
          );
        });
      })
      .catch((err) => {
        console.log(err);
        return msg.edit(errorMessage);
      });

    return msg.edit(
      "✅  Successfully updated all profile pictures in the database."
    );
  },
};
