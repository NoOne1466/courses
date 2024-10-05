const express = require("express");
const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(courseController.getAllCourses) // Get all courses
  .post(
    authController.protect, // Protect route
    authController.restrictTo("User"), // Only instructors and admins can create courses
    courseController.createCourse // Create a new course
  );

router
  .route("/:id")
  .get(courseController.getCourse) // Get a specific course
  .patch(
    authController.protect,
    authController.restrictTo("User"),
    courseController.updateCourse // Update course details
  )
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    courseController.deleteCourse // Only admins can delete courses
  );

// Route to upload the intro video for a specific course
router.patch(
  "/:id/uploadIntroVideo",
  authController.protect,
  authController.restrictTo("User"), // Only instructors can upload the intro video
  courseController.uploadIntroVideo, // Middleware to handle video upload
  courseController.updateCourseWithIntroVideo // Update course with intro video
);

// Route to upload additional videos for a specific course
router.patch(
  "/:id/uploadAdditionalVideos",
  authController.protect,
  authController.restrictTo("User"), // Only instructors can upload additional videos
  courseController.uploadAdditionalVideos, // Middleware to handle additional video uploads
  courseController.addAdditionalVideos // Add uploaded videos to the course
);

module.exports = router;
