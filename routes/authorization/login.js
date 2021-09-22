const express = require("express");
const router = express.Router();

const { generateAccessToken } = require("../../index");
const jwt = require("jsonwebtoken");

// POST authenticate user
router.post("/", async (req, res) => {
  console.log(`[POST] ${req.headers.host} -> LOGIN`);

  if (!req.body.password) {
    return res.sendStatus(400);
  }
  const password = req.body.password;

  if (password.toLowerCase() == "admin") {
    return res.sendStatus(418);
  }

  try {
    // test if password is correct
    if (password === process.env.PASSWORD) {
      // create and save new tokens
      const data = { password: password };
      const accessToken = generateAccessToken(data);
      console.log(`[INFO] -> RECEIVED ACCESSTOKEN`);

      // httpOnly cookie expires in 2 days and is not accessible by client
      res.cookie(
        "token",
        JSON.stringify({
          accessToken: accessToken,
        }),
        {
          maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
          httpOnly: true,
        }
      );
      res.send();
    } else {
      // unauthorized (incorrect password)
      return res.sendStatus(401);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
