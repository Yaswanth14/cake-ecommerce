const mongoose = require("mongoose");
const customOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  flavour: String,
  theme: String,
  weight: Number,
  toppings: String,
  category: {
    type: String,
    enum: ["egg", "eggless", "vegan"],
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
});

const CustomOrder = mongoose.model("CustomOrder", customOrderSchema);
module.exports = CustomOrder;
