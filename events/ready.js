const { client } = require("../index");

client.on("ready", async () => {
  console.log(`[BOT] Logged in as ${client.user.tag}!`);

  client.user.setActivity(`${process.env.PREFIX}help`, {
    type: "LISTENING",
  });

  const guilds = client.guilds.cache.size;
  console.log(`[BOT] Currently in ${guilds} guilds.`);
});
