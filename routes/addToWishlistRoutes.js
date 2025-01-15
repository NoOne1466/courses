const express = require("express");
const authController = require("../controllers/authController");
const wishlistController = require("./../controllers/addToWishlistController");
const router = express.Router();

router
  .route("/")
  .post(authController.protect, wishlistController.addToWishlist);

router.route("/").get(authController.protect, wishlistController.getWishlist);

router
  .route("/")
  .delete(authController.protect, wishlistController.removeFromWishlist);

router
  .route("/purchaseWishlist")
  .post(authController.protect, wishlistController.purchaseWishlist);

module.exports = router;
