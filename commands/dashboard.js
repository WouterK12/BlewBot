const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "dashboard",
  aliases: ["d"],
  guildOnly: true,
  cooldown: 5,
  description: "View the dashboard.",

  async execute(message, args) {
    const linkEmbed = new MessageEmbed()
      .setTitle("BlewBot Dashboard")
      .setDescription(
        `[Click here to open the dashboard](${process.env.DASHBOARD_URL})`
      );

    return message.channel.send(linkEmbed);
  },
};
