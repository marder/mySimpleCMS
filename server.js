require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const helmet = require("helmet");
const expressLayouts = require("express-ejs-layouts");

const bodyParser = require("body-parser");
const methodOverride = require("method-override");

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("\x1b[43m    Connected to database...     \x1b[0m"));

/*
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,
});
*/

app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");

app.use(expressLayouts);
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

app.use(helmet({
  contentSecurityPolicy: false,
}));

//app.use(limiter);
app.use(
  session({
    secret: "my secred key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.set("view engine", "ejs");

const posts = require("./routes/blog");
app.use("/api/posts", posts);

const frontpage = require("./routes/frontpage");
app.use("/api/frontpage", frontpage);

const cms = require("./routes/cms");
app.use("/", cms);

const login = require("./routes/login");
app.use("/login", login);

app.listen(PORT, () =>
  console.log(
    `\x1b[42m Server is running on port: ${PORT} \x1b[0m \n\x1b[41m     http://localhost:${PORT}/      \x1b[0m`
  )
);