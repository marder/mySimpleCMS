//API ROUTES
const express = require("express");
const router = express.Router();
const Data = require("../models/data");

//Getting all posts
router.get("/", async (req, res) => {
  try {
    const frontpage = await Data.findById("67098eba058d3b95c0a45c44");
    res.json(frontpage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
