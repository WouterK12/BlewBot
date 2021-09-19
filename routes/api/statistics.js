const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Event = require("../../models/Event");

// GET statistics
router.get("/", async (req, res) => {
  console.log(`[GET] ${req.headers.host} -> STATISTICS`);

  let statistics = {};

  // uptime
  let uptime = (process.uptime() / 60 / 60).toFixed(1);
  if (uptime >= 24) {
    uptime /= 24;
    uptime = uptime.toFixed(1);
    uptime += " days";
  } else {
    uptime += " hours";
  }
  statistics.uptime = uptime;

  // events
  const events = await Event.find();
  let totalEvents = events.length;
  if (totalEvents >= 1e6) {
    totalEvents = +(totalEvents / 1e6).toFixed(1) + "M";
  } else if (totalEvents >= 1e3) {
    totalEvents = +(totalEvents / 1e3).toFixed(1) + "K";
  }
  statistics.capturedEvents = totalEvents;

  res.status(200).send(statistics);
});

module.exports = router;
