const { client } = require("../index");
const { MessageEmbed } = require("discord.js");
const utils = require("../modules/utils");

const errorEmbed = new MessageEmbed().setColor("#000000").setTitle("❌  Whoops! Something went wrong!").setTimestamp();
const retrieveEmbed = new MessageEmbed().setColor("#000000").setTitle("Retrieving statistics...");

module.exports = {
  name: "user",
  aliases: ["u"],
  guildOnly: true,
  cooldown: 5,
  description: `View statistics of a specific user (${process.env.PREFIX}user @Name)`,

  async execute(message, args) {
    let msg = await message.channel.send(retrieveEmbed);

    const member = await getMemberFromMention(message.guild, args[0]);

    if (!member) {
      errorEmbed.setDescription(`Could not fetch member with tag \`${args[0]}\``);
      return msg.edit(errorEmbed);
    }

    const userInDb = await utils.GetUser(member);

    const statsEmbed = new MessageEmbed()
      .setColor("#000000")
      .setTitle(`${userInDb.name} Voice Activity`)
      .setThumbnail(member.user.avatarURL())
      .setTimestamp();

    let statsForChannels = {};

    let connectedSinceEvent;

    for await (const event of userInDb.events) {
      if (!connectedSinceEvent && event.connected) {
        connectedSinceEvent = event;
        continue;
      }

      if (connectedSinceEvent && !event.connected) {
        const channel = await client.channels.fetch(connectedSinceEvent.channel);
        const timeConnected = +event.time - +connectedSinceEvent.time;

        if (statsForChannels[channel.name]) {
          statsForChannels[channel.name] += timeConnected;
        } else {
          statsForChannels[channel.name] = timeConnected;
        }
        connectedSinceEvent = null;
      }
    }

    for (const [channelName, timeConnected] of Object.entries(statsForChannels)) {
      statsEmbed.addField(channelName, convertMsToTime(timeConnected));
    }

    return msg.edit(statsEmbed);
  },
};

async function getMemberFromMention(guild, mention) {
  if (!mention) return;

  if (mention.startsWith("<@") && mention.endsWith(">")) {
    mention = mention.slice(2, -1);

    if (mention.startsWith("!")) {
      mention = mention.slice(1);
    }

    return await guild.members.fetch(mention);
  }
}

function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  let result = `${seconds} second${seconds > 1 ? "s" : ""}`;
  if (minutes > 0) result = `${minutes} minute${minutes > 1 ? "s" : ""}, ` + result;
  if (hours > 0) result = `${hours} hour${hours > 1 ? "s" : ""}, ` + result;

  return result;
}
