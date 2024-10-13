const express = require("express");
const router = express.Router();
const Post = require("../models/blog");
const PageData = require("../models/data");
const multer = require("multer");
const fs = require("fs");

//Image upload setup
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

//TODO: podmiana pliku w edycji posta

//TODO: zapodać message zamiast errora
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb(new Error("Only PNG and JPEG files are allowed"), false);
  }
};

let upload = multer({
  storage: storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 1 }, // 1MB file size limit
}).single("image");

//Content view
router.get("/", checkSignIn, async (req, res) => {
  let searchOptions = {};
  try {
    const searchResult = await Post.find(searchOptions);
    res.render("index", {
      posts: searchResult,
      searchOptions: req.query,
      path: req.url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Edit view
router.get("/edit/:id", checkSignIn, getPost, async (req, res) => {
  try {
    res.render("edit", {
      post: res.post,
      path: req.url,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

//Edit route
router.put("/:id", checkSignIn, getPost, upload, async (req, res) => {
  let post = res.post;
  let new_image = "";

  try {
    if (req.file) {
      new_image = req.file.filename;
      fs.unlinkSync("./public/uploads/" + req.body.old_image);
    } else {
      new_image = req.body.old_image;
    }
    (post.title = req.body.title),
      (post.author = req.body.author),
      (post.content = req.body.content),
      (post.image = new_image),
      (post.updatedAt = Date.now()),
      await post.save();
    req.session.message = {
      type: "success",
      message: "Post został zaktualizowany",
    };
    res.redirect("/");
  } catch (err) {
    if (post == null) {
      res.json({ message: err.message, type: "danger" });
      res.redirect("/");
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//Front page view
router.get("/frontpage", checkSignIn, async (req, res) => {
  try {
    data = await PageData.findById("67098eba058d3b95c0a45c44");
    res.render("frontpage", {
      heroHeader: data.hero.header,
      heroContent: data.hero.content,
      aboutHeader: data.about.header,
      aboutContent: data.about.content,
      stripe: data.stripe,
      contactAdress: data.contact.adress,
      contactPhone: data.contact.phone,
      contactEmail: data.contact.email,
      path: req.url,
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

//Edit front page route
router.put("/frontpage/edit", checkSignIn, async (req, res) => {
  try {
    data = await PageData.findById("67098eba058d3b95c0a45c44");
    (data.hero.header = req.body.heroHeader),
      (data.hero.content = req.body.heroContent),
      (data.about.header = req.body.aboutHeader),
      (data.about.content = req.body.aboutContent),
      (data.stripe = req.body.stripe),
      (data.contact.adress = req.body.contactAdress),
      (data.contact.phone = req.body.contactPhone),
      (data.contact.email = req.body.contactEmail),
      await data.save();
    res.redirect("/frontpage");
  } catch (err) {
    if (post == null) {
      console.error(err);
      res.redirect("/");
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//Adding new post view
router.get("/add", checkSignIn, async (req, res) => {
  try {
    res.render("add_post", {
      post: new Post(),
      path: req.url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//New post route
router.post("/", checkSignIn, upload, async (req, res) => {
  const post = new Post({
    title: req.body.title,
    author: req.body.author,
    content: req.body.content,
    image: req.file.filename,
  });
  try {
    const newPost = await post.save();
    req.session.message = {
      type: "success",
      message: "Post został dodany",
    };
    res.redirect(`edit/${newPost._id}`);
  } catch (err) {
    if (post == null) {
      req.session.message = {
        type: "danger",
        message: "Post nie został dodany",
      };
      res.redirect("/");
    } else {
      res.status(400).json({ message: err.message });
    }
  }
});

//Adding new post view
router.get("/apidesc", checkSignIn, async (req, res) => {
  try {
    res.render("api", {
      path: req.url,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(function () {
    console.log("User logged out.");
  });
  res.redirect("/login");
});

//Deleting one post
router.delete("/:id", getPost, async (req, res) => {
  let post;
  try {
    post = res.post;
    await post.deleteOne();
    res.redirect("/");
  } catch (err) {
    if (post == null) {
      console.log(err);
      res.redirect("/");
    } else {
      console.log(err);
      res.redirect("/");
    }
  }
});

//Getting one post - function
async function getPost(req, res, next) {
  let post;
  try {
    post = await Post.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: "Cannot find post..." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.post = post;
  next();
}

//TODO: describe it
function checkSignIn(req, res, next) {
  if (req.session.user) {
    next(); //If session exists, proceed to page
  } else {
    res.redirect("/login");
  }
}

module.exports = router;
