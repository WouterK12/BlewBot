const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// GET users
router.get("/", async (req, res) => {
  console.log(`[GET] ${req.headers.host} -> USERS`);
  User.find()
    .populate("events")
    .then((users) => {
      if (!users) throw 404;

      res.status(200).send(users);
    })
    .catch((err) => {
      if (err === 404) return res.status(err).send("No users found");
      res.status(500).send(err.message);
    });
});

// GET user by id
router.get("/:id", (req, res) => {
  console.log(`[GET] ${req.headers.host} -> USER (${req.params.id})`);

  User.findById(req.params.id)
    .then((user) => {
      if (!user) throw 404;
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err === 404) return res.status(err).send("Not found");
      res.status(500).send(err.message);
    });
});

module.exports = router;
