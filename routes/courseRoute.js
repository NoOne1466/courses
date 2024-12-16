const express = require("express");

const courseController = require("../controllers/courseController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(courseController.getAllCourses)
  .post(
    authController.protect,
    authController.restrictTo("User"),
    courseController.createCourse
  );

router
  .route("/:id")
  .get(courseController.getCourse)
  .patch(
    authController.protect,
    authController.restrictTo("User"),
    courseController.updateCourse
  )
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    courseController.deleteCourse
  );

router
  .route("/:id/intro-video")
  .patch(
    authController.protect,
    authController.restrictTo("User"),
    courseController.uploadIntroVideoFile,
    courseController.uploadIntroVideo
  );

// Chapter Routes
router
  .route("/:courseId/chapters")
  .post(
    authController.protect,
    authController.restrictTo("User"),
    courseController.addChapter
  );
router
  .route("/:courseId/chapters/:chapterId")
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    courseController.deleteChapter
  );

router
  .route("/:courseId/chapters/:chapterId/video")
  .post(
    authController.protect,
    authController.restrictTo("User"),
    courseController.uploadSingleVideo,
    courseController.addVideoToChapter
  );

router
  .route("/:courseId/chapters/:chapterId/video/:videoId")
  .delete(
    authController.protect,
    authController.restrictTo("User"),
    courseController.deleteVideo
  );

router
  .route("/:courseId/chapters/:chapterId/quiz")
  .post(authController.protect, courseController.addQuizToChapter);

router
  .route("/:courseId/chapters/:chapterId/quiz/:quizId/submit")
  .post(authController.protect, courseController.submitQuiz);

module.exports = router;
