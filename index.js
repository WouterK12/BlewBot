// BlewBot
// By Wouter Koopman

require("dotenv").config();
const discord = require("discord.js");
const fs = require("fs");
const client = new discord.Client();

// Mongoose connection
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/blewbot", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.once("open", function () {
  console.log("MongoDB database connection established successfully");
});

module.exports = {
  client: client,
};

// Loop through all events,
// enable all events
fs.readdir("./events/", (err, files) => {
  files.forEach((file) => {
    require(`./events/${file}`);
  });
});

// Commands
client.cooldowns = new discord.Collection();
client.commands = new discord.Collection();
fs.readdir("./commands/", (err, files) => {
  files.forEach((file) => {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
  });
});

process.on("unhandledRejection", (error) => {
  console.error("Uncaught Promise Rejection", error);
});

// Properly close client when CTRL + C is used in the terminal
process.on("SIGINT", () => {
  client.destroy();
});

client.login(process.env.TOKEN);

// express server
const express = require("express");
const app = express();
const port = process.env.PORT || 5800;

app.use(express.json());
app.use("/api/users", require("./routes/api/users"));
app.use("/api/events", require("./routes/api/events"));
app.use("/api/statistics", require("./routes/api/statistics"));
app.use(express.static("client"));
app.listen(port, () => console.log(`[WEB] Server started on port ${port}`));
