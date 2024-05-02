const express = require("express");
const userRouter = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return passwordHash;
};

userRouter.get("/", async (req, res) => {
  res.render("user/home");
});

userRouter.get("/register", async (req, res) => {
  res.render("user/register");
});

userRouter.post("/register", async (req, res) => {
  const { name, email, contact, password, image } = req.body;
  let user = await User.findOne({ email });

  const spassword = await securePassword(password);
  user = new User({
    name: name,
    email: email,
    contact: contact,
    password: spassword,
    image: image,
    status: false,
  });

  user.save();
  res.redirect("/login");
});

userRouter.get("/login", async (req, res) => {
  res.render("user/login");
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userData = await User.findOne({ email });

  if (!userData) {
    req.flash("error in finding user");
    console.log("error in finding user");
    return res.redirect("/login");
  }

  const passwordMatch = await bcrypt.compare(password, userData.password);
  if (!passwordMatch) {
    req.flash("Password didn't match database");
    return res.redirect("/login");
  }

  req.session.user = userData;

  res.redirect("/landing");
});

userRouter.get("/landing", async (req, res) => {
  const user = req.session.user;

  res.render("user/landing", { user });
});

module.exports = userRouter;
