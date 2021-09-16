const { client } = require("../index");
const { MessageEmbed } = require("discord.js");
const Event = require("../models/Event");

const retrieveEmbed = new MessageEmbed()
  .setColor("#000000")
  .setTitle("Retrieving statistics...");

module.exports = {
  name: "statistics",
  aliases: ["stats"],
  guildOnly: false,
  cooldown: 5,
  description: "View BlewBot's statistics.",

  async execute(message) {
    let msg = await message.channel.send(retrieveEmbed);

    // uptime
    let uptime = (process.uptime() / 60 / 60).toFixed(1);
    if (uptime >= 24) {
      uptime /= 24;
      uptime = uptime.toFixed(1);
      uptime += " days";
    } else {
      uptime += " hours";
    }
    uptime = `\`Uptime\` | ${uptime}`;

    // data
    const guilds = `\`Guilds\` | ${client.guilds.cache.size}`;
    const dashboard = `\`Dashboard\` | [link](${process.env.DASHBOARD_URL})`;

    // events
    const events = await Event.find();
    let totalEvents = events.length;
    if (totalEvents >= 1e6) {
      totalEvents = +(totalEvents / 1e6).toFixed(1) + "M";
    } else if (totalEvents >= 1e3) {
      totalEvents = +(totalEvents / 1e3).toFixed(1) + "K";
    }
    const capturedEvents = `\`Captured events\` | ${totalEvents}`;

    const statsEmbed = new MessageEmbed()
      .setColor("#000000")
      .setTitle("BlewBot Statistics")
      .addField(
        "Online",
        `${uptime}\n${guilds}\n${dashboard}\n${capturedEvents}`
      )
      .setThumbnail(client.user.avatarURL())
      .setTimestamp();

    msg.edit(statsEmbed);
  },
};
