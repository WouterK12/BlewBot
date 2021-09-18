const express = require("express");
const router = express.Router();
const Event = require("../../models/Event");

// GET events
router.get("/", async (req, res) => {
  console.log(`[GET] ${req.headers.host} -> EVENTS`);
  Event.find()
    .populate("user")
    .then((events) => {
      if (!events) throw 404;

      res.status(200).send(events);
    })
    .catch((err) => {
      if (err === 404) return res.status(err).send("No events found");
      res.status(500).send(err.message);
    });
});

// GET event by id
router.get("/:id", (req, res) => {
  console.log(`[GET] ${req.headers.host} -> EVENT (${req.params.id})`);

  Event.findById(req.params.id)
    .then((event) => {
      if (!event) throw 404;
      res.status(200).send(event);
    })
    .catch((err) => {
      if (err === 404) return res.status(err).send("Not found");
      res.status(500).send(err.message);
    });
});

module.exports = router;
