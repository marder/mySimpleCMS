//API ROUTES
const express = require("express");
const router = express.Router();
const Blog = require("../models/blog");

//Getting all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Blog.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Getting all posts with pagination
router.get("/pages", paginatedResults(Blog), (req, res) => {
  res.json(res.paginatedResults);
});

//Getting one post
router.get("/:id", getBlogPost, (req, res) => {
  res.send(res.post);
});

//Pagination with search
function paginatedResults(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await model.find().countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    if (!limit) {
      results.totalPages = 1;
    } else {
      results.totalPages = Math.ceil(
        (await Blog.find().countDocuments().exec()) / limit
      );
    }
    try {
      results.results = await model.find().limit(limit).skip(startIndex).exec();

      res.paginatedResults = results;
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

//Getting one post - function
async function getBlogPost(req, res, next) {
  let post;
  try {
    post = await Blog.findById(req.params.id);
    if (post == null) {
      return res.status(404).json({ message: "Cannot find the post..." });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.post = post;
  next();
}

module.exports = router;
