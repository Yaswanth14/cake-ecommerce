const express = require("express");
const userRouter = express.Router();
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Order = require("../models/ordersModel");
const CustomOrder = require("../models/cakeModel");
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

userRouter.get("/landing", async (req, res) => {
  const user = req.session.user;
  const productsCollection = await Product.find({});
  const products = [...productsCollection];

  res.render("user/landing", { user, products });
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
  if (userData.name == "admin") {
    res.render("admin/add-product", { user: 0 });
  } else res.redirect("/landing");
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

userRouter.get("/orders", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Please login to view orders");
  }

  try {
    const user = req.session.user;

    // Find user's orders
    const orders = await Order.find({ userId: user._id }).populate(
      "order.product"
    );

    if (orders && orders.length > 0) {
      // Calculate total for each order
      const ordersWithTotal = orders.map((order) => {
        const total = order.order.reduce(
          (acc, item) => acc + item.product.price,
          0
        );
        return { orderItems: order.order, total, orderDate: order.orderDate };
      });

      res.render("user/orders", { orders: ordersWithTotal, user });
    } else {
      res.render("user/orders", { orders: [], user });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching order details");
  }
});

userRouter.post("/place-order", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Please login to place order");
  }

  try {
    const user = req.session.user;

    // Find user's cart
    const cart = await Cart.findOne({ userId: user._id }).populate(
      "cart.product"
    );
    if (!cart || cart.cart.length === 0) {
      return res.status(400).send("Your cart is empty");
    }

    // Find existing order or create a new one
    let order = await Order.findOne({ userId: user._id });

    if (order) {
      // Append items from cart to existing order
      order.order = order.order.concat(cart.cart);
    } else {
      // Create a new order with the items from the cart
      order = new Order({
        userId: user._id,
        order: cart.cart,
      });
    }

    // Save the order to the database
    await order.save();

    // Delete the user's cart
    await Cart.deleteOne({ userId: user._id });

    res.redirect("orders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing the order");
  }
});

userRouter
  .route("/custom-order")
  .get((req, res) => {
    if (!req.session.user) {
      return res.status(401).send("Please login to place a custom order");
    }

    res.render("user/custom-order", { user: req.session.user });
  })
  .post(async (req, res) => {
    if (!req.session.user) {
      return res.status(401).send("Please login to place a custom order");
    }

    try {
      const { flavour, theme, weight, toppings, category } = req.body;
      const user = req.session.user;

      const customOrder = new CustomOrder({
        userId: user._id,
        flavour,
        theme,
        weight,
        toppings,
        category,
        orderDate: new Date(),
      });

      await customOrder.save();
      res.redirect("/landing");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error placing the custom order");
    }
  });

module.exports = userRouter;
