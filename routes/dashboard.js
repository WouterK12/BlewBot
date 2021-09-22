const express = require("express");
const router = express.Router();
const path = require("path");

router.get("/", async (req, res) => {
  res.status(200).sendFile(path.join(__dirname, `../pages/dashboard.html`));
});

module.exports = router;
