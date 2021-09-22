const express = require("express");
const router = express.Router();

router.delete("/", async (req, res) => {
  console.log(`[DELETE] ${req.headers.host} -> LOGOUT`);

  try {
    res.cookie("token", 0, { maxAge: 0 });
    return res.sendStatus(204);
  } catch (err) {
    return res.sendStatus(500);
  }
});

module.exports = router;
