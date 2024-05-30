const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  order: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    },
  ],
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
