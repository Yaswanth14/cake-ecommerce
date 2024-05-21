const express = require("express");
const userRouter = express.Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const bcrypt = require("bcrypt");

const securePassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return passwordHash;
};

userRouter.get("/", async (req, res) => {
  res.render("user/home", { user: 0 });
});

userRouter.get("/register", async (req, res) => {
  res.render("user/register", { user: 0 });
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
  res.render("user/login", { user: 0 });
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
  if (userData.isAdmin) {
    res.render("admin/add-product", { user: 0 });
  }

  res.redirect("/landing");
});

userRouter.get("/landing", async (req, res) => {
  const user = req.session.user;
  const productsCollection = await Product.find({});
  const products = [...productsCollection];

  res.render("user/landing", { user, products });
});

userRouter.get("/details", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Please login to view cart");
  }

  try {
    const user = req.session.user;

    // Find user's cart
    const cart = await Cart.findOne({ userId: user._id }).populate(
      "cart.product"
    );

    if (cart) {
      const total = cart.cart.reduce(
        (acc, item) => acc + item.product.price,
        0
      );
      res.render("user/cart", { cart: cart.cart, total, user });
    } else {
      res.render("user/cart", { cart: [], total: 0, user });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cart details");
  }
});

userRouter.post("/place-order", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Please login to place order");
  }

  try {
    const user = req.session.user;

    // Find user's cart
    const cart = await Cart.deleteOne({ userId: user._id });
    // res.status(200).send("Order placed successfully!");
    res.redirect("landing");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing the order");
  }
});

module.exports = userRouter;
