const dotenv = require("dotenv").config();

module.exports = {
  database: process.env.MONGO_URL || "mongodb://localhost:27017/dreamcake",
};
