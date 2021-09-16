const { client } = require("../index");

module.exports = {
  name: "ping",
  aliases: ["p"],
  guildOnly: true,
  cooldown: 1,
  description: "Pong!",

  async execute(message, args) {
    return message.channel.send(
      `Pong! 🏓\n(${Date.now() - message.createdTimestamp}ms, API: ${Math.round(
        client.ws.ping
      )}ms)`
    );
  },
};
