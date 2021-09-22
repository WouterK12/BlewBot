const { authToken } = require("../../index");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// requested if user visits login screen
router.get("/", async (req, res) => {
  console.log(`[GET] ${req.headers.host} -> TOKEN`);

  const token = req.cookies.token;
  if (!token) return res.sendStatus(403);

  authToken(req, res, next);

  function next() {
    return res.sendStatus(200);
  }
});

module.exports = router;
