const { client } = require("../index");

client.on("ready", async () => {
  console.log(`[BOT] Logged in as ${client.user.tag}!`);

  client.user.setActivity(`${process.env.PREFIX}help`, {
    type: "LISTENING",
  });

  const guilds = client.guilds.cache.size;
  console.log(`[BOT] Currently in ${guilds} guilds.`);

  // Todo: check of users in voice channel(s) and update their latest events to match their current conditions
  // (if the bot unexpectedly went offline)
});
