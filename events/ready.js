const { client } = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Event = require("../models/Event");

client.on("ready", async () => {
  console.log(`[BOT] Logged in as ${client.user.tag}!`);

  client.user.setActivity(`${process.env.PREFIX}help`, {
    type: "LISTENING",
  });

  const guilds = client.guilds.cache.size;
  console.log(`[BOT] Currently in ${guilds} guilds.`);

  CheckVoiceChannelActivity();
});

// Check of users in voice channel(s) and update their latest events to match their current conditions
// (if the bot unexpectedly went offline)
function CheckVoiceChannelActivity() {
  client.guilds.cache.forEach(async (guild) => {
    // check only first voice channel of guild
    let channel = guild.channels.cache.find((c) => c.type === "voice");

    const users = await User.find().populate("events");
    users.forEach((user) => {
      // test if user is connected
      let userIsConnected = channel.members.find(
        (m) => m.user.id == user.userId
      );
      // fix type
      userIsConnected = userIsConnected ? true : false;

      UpdateUser(user, userIsConnected);
    });
  });
}

function UpdateUser(user, connected) {
  let latestEvent = user.events[user.events.length - 1];

  if (latestEvent.connected === false) {
    if (connected === false) return; // event doesn't need to be updated
    if (connected === true) {
      CreateNewEvent(latestEvent, connected);
    }
  }

  if (latestEvent.connected === true) {
    if (connected === false) {
      SetDisconnected(latestEvent);
    }
    if (connected === true) {
      SetDisconnected(latestEvent);
      CreateNewEvent(latestEvent);
    }
  }
}

function CreateNewEvent(latestEvent) {
  const newEvent = new Event({
    _id: mongoose.Types.ObjectId(),
    channel: latestEvent.channel,
    connected: true,
    selfMute: false,
    selfDeaf: false,
    selfVideo: false,
    speaking: null,
    streaming: false,
    time: Date.now(),
  });
  newEvent.save();
}

function SetDisconnected(event) {
  event.connected = false;
  event.save();
}
