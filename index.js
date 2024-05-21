const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");

const config = require("./config/db");

const app = express();
const port = process.env.PORT || 3000;
const db = process.env.MONGO_URL;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/views", express.static(path.join(__dirname, "views")));
app.use("/public", express.static(path.join(__dirname, "public")));

const userRouter = require("./routes/user-router");
const adminRouter = require("./routes/admin-router");
const cartRouter = require("./routes/cart-router");

mongoose
  .connect(config.database)
  .then(() => {
    console.log(`Database Connected to ${db}`);
  })
  .catch((err) => {
    console.log("Database connection failed" + err);
  });

app.set("view engine", "ejs");

app.use(
  session({
    secret: "sessionSecret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 1000 * 60, secure: false },
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/cart", cartRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
