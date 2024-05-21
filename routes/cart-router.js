const express = require("express");
const cartRouter = express.Router();
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

cartRouter.get("/landing", async (req, res) => {
  const user = req.session.user;
  const productsCollection = await Product.find({});
  const products = [...productsCollection];

  res.render("user/landing", { user, products });
});

cartRouter.post("/add", async (req, res) => {
  const { productId } = req.body;

  // Check if user is logged in
  if (!req.session.user) {
    console.log("Not logged in");
    return res.status(401).send("Please login to add to cart");
  }

  try {
    const user = req.session.user; // Assuming 'req.user' contains logged-in user

    // Check if cart exists for user
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({ userId: user._id });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Add product to cart (ensure unique products)
    const existingItem = cart.cart.find((item) =>
      item.product.equals(productId)
    );
    if (!existingItem) {
      cart.cart.push({ product });
    }

    await cart.save();
    res.status(200).send("Product added to cart successfully!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding to cart");
  }
});

module.exports = cartRouter;
