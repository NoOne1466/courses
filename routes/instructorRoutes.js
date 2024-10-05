const express = require("express");
const Instructor = require("../models/instructorModel");

const instructorController = require("../controllers/instructorController");
const authController = require("../controllers/authController");
const factory = require("../controllers/handlerFactory");
// const reviewDoctor = require("../models/reviewDoctorsModel");

const router = express.Router();
router.get("/homePage", (req, res) => {
  res.send("Welcome to the homepage!");
});

router.post("/signup", authController.signup(Instructor));
router.post("/login", authController.login(Instructor));
router.post("/forgotPassword", authController.forgotPassword(Instructor));
router.patch("/resetPassword", authController.resetPassword(Instructor));

router.use(authController.protect);
router.get(
  "/me",
  authController.restrictTo("Instructor"),
  instructorController.getMe,
  instructorController.getInstructor
);
router.patch("/updateMyPassword", authController.updatePassword(Instructor));
router.patch("/udpateMe", factory.uploadPhoto, instructorController.updateMe);
router.delete("/deleteMe", instructorController.deleteMe);

router
  .route("/")
  .get(authController.protect, instructorController.getAllInstructors)
  .post(
    authController.protect,
    authController.restrictToSuperAdmin,
    instructorController.createInstructor
  );

// router.use("/:InstructorId/reviews", reviewInstructorsRouter);

router
  .route("/:id")
  .get(instructorController.getInstructor)
  .patch(
    authController.restrictToSuperAdmin,
    instructorController.createInstructor,
    instructorController.updateInstructor
  )
  .delete(
    authController.restrictToSuperAdmin,
    instructorController.createInstructor,
    instructorController.deleteInstructor
  );

// Favorites routes

module.exports = router;
