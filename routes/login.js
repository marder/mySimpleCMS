const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const User = { login: process.env.USER, password: process.env.PASSWORD };

router.get("/", (req, res) => {
  res.render("login", { path: req.url });
});

router.post("/", async (req, res) => {
  if (!req.body.login || !req.body.password) {
    res.render("login", { message: "Podaj login i hasło!", path: req.url });
  }
  try {
    if (await bcrypt.compare(req.body.password, User.password)) {
      req.session.user = User;
      res.redirect("/");
      return;
    } else {
      res.render("login", { message: "Nieprawidłowe dane!", type: 'danger', path: req.url });
    }
  } catch (error) {
    res.status(500).send();  }
});

router.get("/generate", async (req, res) => {
  let password = "forest1337";
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

module.exports = router;