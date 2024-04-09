const express = require("express");
const userRouter = express.Router();

userRouter.get("/", async (req, res) => {
  res.render("user/home");
});

userRouter.get("/register", async (req, res) => {
  res.render("user/register");
});

userRouter.get("/login", async (req, res) => {
  res.render("user/login");
});

module.exports = userRouter;
