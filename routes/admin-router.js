const express = require("express");
const adminRouter = express.Router();
const path = require("path");

const Product = require("../models/productModel");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Set the destination directory for uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

adminRouter.get("/add-product", (req, res) => {
  res.render("admin/add-product", { user: 0 });
});

adminRouter.post("/add-product", upload.single("image"), async (req, res) => {
  const { title, price, description, category } = req.body;
  var imageName;
  if (req.file) imageName = req.file.filename;
  else console.log("No image found");

  const product = new Product({
    title,
    price,
    description,
    category,
    image: imageName,
  });

  try {
    await product.save();
    console.log("success");
    req.flash("success", "Product added successfully!");
    res.redirect("../admin/add-product");
  } catch (error) {
    console.log(error);
    res.send("Error in adding product");
  }
});

module.exports = adminRouter;
