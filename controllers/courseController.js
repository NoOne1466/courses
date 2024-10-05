const Course = require("../models/coursesModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const multer = require("multer");

// Set up Multer for video uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/videos/courses");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `course-video-${req.params.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(
      new AppError("Not a video! Please upload only video files.", 400),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Middleware for uploading intro video
exports.uploadIntroVideo = upload.single("introVideo");

// Middleware for uploading additional videos
exports.uploadAdditionalVideos = upload.array("videos", 10); // Allow multiple additional videos

// Update course with intro video
exports.updateCourseWithIntroVideo = catchAsync(async (req, res, next) => {
  if (req.file) req.body.introVideo = `videos/courses/${req.file.filename}`;

  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

// Add additional videos to a course
exports.addAdditionalVideos = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  // Add each uploaded video path to the course's videos array
  req.files.forEach((file) => {
    course.videos.push(`videos/courses/${file.filename}`);
  });

  await course.save();

  res.status(200).json({
    status: "success",
    data: {
      course,
    },
  });
});

// Generic controllers
exports.createCourse = factory.createOne(Course);
exports.getCourse = factory.getOne(Course);
exports.getAllCourses = factory.getAll(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);
