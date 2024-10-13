const mongoose = require("mongoose");

const pageDataSchema = new mongoose.Schema({
  hero: {
    header: String,
    content: String,
  },
  about: {
    header: String,
    content: String,
  },
  stripe: String,
  contact: {
    adress: String,
    phone: String,
    email: String,
  },
});

module.exports = mongoose.model("PageData", pageDataSchema);
