const Wishlist = require("../models/addToWishlistModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { PaymentGateway, paymobAPI } = require("../services/PaymentGetaway.js");

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Authenticated user ID
  const { courseId } = req.body;

  if (!courseId) {
    return next(new AppError("Item ID is required to add to wishlist", 400));
  }

  // Check if wishlist exists for the user
  let wishlist = await Wishlist.findOne({ user: userId });
  console.log(wishlist);
  if (!wishlist) {
    // Create a new wishlist if it doesn't exist
    wishlist = new Wishlist({
      user: userId,
      items: [{ courseId }],
    });
  } else {
    // Add the item to the wishlist if not already added
    const alreadyInWishlist = wishlist.items.some(
      (item) => item.courseId.toString() === courseId
    );

    if (alreadyInWishlist) {
      return next(new AppError("Item already in wishlist", 400));
    }

    wishlist.items.push({ courseId });
  }

  await wishlist.save();

  res.status(201).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});

exports.getWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.itemId"
  );

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const userId = req.user.id; // Authenticated user ID
  const { courseId } = req.body;

  if (!courseId) {
    return next(
      new AppError("Item ID is required to remove from wishlist", 400)
    );
  }

  // Find the user's wishlist
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    return next(new AppError("Wishlist not found", 404));
  }

  // Check if the item exists in the wishlist
  const itemIndex = wishlist.items.findIndex(
    (item) => item.courseId.toString() === courseId
  );

  if (itemIndex === -1) {
    return next(new AppError("Item not found in wishlist", 404));
  }

  // Remove the item
  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  res.status(200).json({
    status: "success",
    message: "Item removed from wishlist",
    data: {
      wishlist,
    },
  });
});

exports.purchaseWishlist = catchAsync(async (req, res, next) => {
  const { wishlistId } = req.body;
  const wishlist = await Wishlist.findOne({
    _id: wishlistId,
    user: req.user._id,
  })
    .populate("items.courseId")
    .exec();

  if (!wishlist || !wishlist.items.length) {
    return next(new AppError("Your wishlist is empty or invalid.", 400));
  }

  const uniqueOrderId = `${wishlist._id}-${Date.now()}`;

  // Calculate total price in cents for all courses
  const totalPriceInCents = wishlist.items.reduce(
    (total, item) => total + item.courseId.price,
    0
  );
  console.log(totalPriceInCents);

  // Payment gateway integration
  const paymentGateway = new PaymentGateway(
    paymobAPI,
    process.env.API_KEY,
    process.env.INTEGRATION_ID
  );
  await paymentGateway.getToken();

  const paymobOrder = await paymentGateway.createOrder({
    id: uniqueOrderId,
    priceInCents: totalPriceInCents * 100,
    name: "Course Bundle Purchase",
    description: `Purchase of ${wishlist.items.length} courses.`,
  });
  console.log("xx");

  // uEmail,
  // uFirstName,
  // uLastName,
  // uPhoneNumber,
  // orderId,
  // priceInCents,

  console.log(
    req.user.email,
    req.user.firstName,
    req.user.lastName,
    req.user.phoneNumber,
    wishlistId,
    totalPriceInCents
  );
  const paymentToken = await paymentGateway.createPaymentGateway({
    uEmail: req.user.email,
    uFirstName: req.user.firstName,
    uLastName: req.user.lastName,
    uPhoneNumber: req.user.phoneNumber || 09995000,
    orderId: +uniqueOrderId,
    priceInCents: totalPriceInCents * 100,
  });

  const paymentURL = process.env.IFRAME_URL.replace("{{TOKEN}}", paymentToken);

  res.status(201).json({
    status: "success",
    paymentURL,
  });
});

exports.coursePaymentWebhook = catchAsync(async (req, res, next) => {
  const paymobAns = req.body;
  const hmac = req.query.hmac;

  if (!PaymentGateway.verifyHmac(paymobAns, hmac, process.env.HMAC_SECRET)) {
    return next(new AppError("Invalid HMAC", 400));
  }

  if (paymobAns.type !== "TRANSACTION" || !paymobAns.obj.success) {
    return res.status(200).json({ status: "success" });
  }

  const wishlistId = paymobAns.obj.order.merchant_order_id;
  const wishlist = await Wishlist.findById(wishlistId);

  if (!wishlist) {
    return next(new AppError("Wishlist not found.", 404));
  }

  // Mark courses as purchased for the user
  await User.findByIdAndUpdate(wishlist.user, {
    $addToSet: { purchasedCourses: { $each: wishlist.courses } },
  });

  // Clear wishlist after successful purchase
  await Wishlist.findByIdAndDelete(wishlistId);

  res.status(200).json({ status: "success" });
});
