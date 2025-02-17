// const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
// const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const path = require("path");
const AppError = require("./utils/appError");
//const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const instructorRouter = require("./routes/instructorRoutes");
const adminRouter = require("./routes/adminRoutes");
const courseRouter = require("./routes/courseRoute");
const chatRouter = require("./routes/chatRoutes");
const wishlistRoutes = require("./routes/addToWishlistRoutes");

// const favoriteRouter = require("./routes/favoriteRoutes.js");
// const viewRouter = require("./routes/viewRoutes");

//
const session = require("express-session");
const passport = require("passport");

//

// start express with const app
const app = express();

//
app.set("view engine", "ejs");

app.use("/public", express.static(path.join(__dirname, "public")));

// Middleware
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);
app.use(passport.initialize());
app.use(passport.session());

//

app.use(express.static(path.join(__dirname, "public")));

// app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
// app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// // Prevent parameter pollution
// app.use(
//   hpp({
//     whitelist: [
//       "duration",
//       "ratingsQuantity",
//       "ratingsAverage",
//       "maxGroupSize",
//       "difficulty",
//       "price",
//     ],
//   })
// );

app.use(compression());
// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// 3) ROUTES
// app.use("/", viewRouter);
app.head("/check", (req, res) => {
  res.status(200).send();
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/instructors", instructorRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/chats", chatRouter);

app.use("/api/v1/wishlist", wishlistRoutes);

// app.use("/api/v1", webhookRouter);

// app.use("/", googleAuthRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
  // console.log(err);
  res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
  });
});

module.exports = app;
