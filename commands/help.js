const { client } = require("../index");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h"],
  guildOnly: false,
  cooldown: 0,
  description: "View a list of commands.",

  async execute(message, args) {
    const helpEmbed = new MessageEmbed()
      .setTitle("BlewBot Help")
      .setDescription(
        "BlewBot is used to keep track of activity in voice channels.\nBy [Wouter](https://wouterkoopman.com)"
      )
      .setThumbnail(client.user.avatarURL());

    var commands = "";

    client.commands.forEach((command) => {
      commands += `\`${process.env.PREFIX + command.name}\` | ${
        command.description
      }\n`;
    });

    helpEmbed.addField("Commands", commands);

    message.channel.send(helpEmbed);
  },
};
