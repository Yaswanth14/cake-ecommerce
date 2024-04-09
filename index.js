const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");

const config = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;
const db = process.env.MONGO_URL;

const userRouter = require("./routes/user-router");

mongoose
  .connect(config.database)
  .then(() => {
    console.log(`Database Connected to ${db}`);
  })
  .catch((err) => {
    console.log("Database connection failed" + err);
  });

app.set("view engine", "ejs");

app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", userRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
