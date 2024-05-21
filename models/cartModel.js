const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  cart: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
