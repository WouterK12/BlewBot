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
  authToken,
  generateAccessToken,
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
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5800;

app.use(express.json()); // for parsing application/json
app.use(cookieParser());

// nginx
app.set("trust proxy", 1);
// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/users", authToken, require("./routes/api/users"));
app.use("/api/events", authToken, require("./routes/api/events"));
app.use("/api/statistics", authToken, require("./routes/api/statistics"));
app.use("/login", limiter, require("./routes/authorization/login"));
app.use("/token", require("./routes/authorization/token"));
app.use("/logout", require("./routes/authorization/logout"));
app.use("/dashboard", authToken, require("./routes/dashboard"));

// enable CORS (https://enable-cors.org/server.html)
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(express.static("client"));

// middleware
// check if token is valid
function authToken(req, res, next) {
  // httpOnly cookie (not accessible from client)
  let token = req.cookies.token;
  if (token == null) return res.status(401).redirect("/");

  token = JSON.parse(token);

  jwt.verify(token.accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) return res.status(403).redirect("/");
    req.token = token;
    next();
  });
}

// generate a new accesstoken (on login)
function generateAccessToken(data) {
  return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "2d",
  }); // auto logout in 2 days
}

app.listen(port, () => console.log(`[WEB] Server started on port ${port}`));
