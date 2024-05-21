function addToCart(productId) {
  axios
    .post("/cart/add", { productId })
    .then((response) => {
      // Handle success response (optional: update cart UI)
      console.log("Product added to cart:", response.data);
    })
    .catch((error) => {
      console.error("Error adding to cart:", error);
    });
}
