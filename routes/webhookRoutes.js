const express = require("express");
const authController = require("../controllers/authController");
// const orderController = require("../controllers/orderController");
const addToWishlistController = require("../controllers/addToWishlistController");

const router = express.Router();

router.route("/webhook").post(addToWishlistController.coursePaymentWebhook);

module.exports = router;
