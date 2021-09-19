const { client } = require("../index");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports = {
  name: "quote",
  aliases: ["q"],
  guildOnly: false,
  cooldown: 5,
  description: "Pong!",

  async execute(message, args) {
    axios
      .get(`https://quote-garden.herokuapp.com/api/v3/quotes/random`)
      .then((res) => {
        let quote = res.data.data[0];

        const quoteEmbed = new MessageEmbed().setDescription(
          `${quote.quoteText}\n\n - ${quote.quoteAuthor}`
        );
        return message.channel.send(quoteEmbed);
      })
      .catch((err) => {
        console.log(err);
        return message.channel.send(
          "Whoops! Something went wrong!\nTry again later."
        );
      });
  },
};
