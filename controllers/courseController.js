const Course = require("../models/coursesModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");
const AppError = require("../utils/appError");
const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/video");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${req.model.id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("video")) {
    cb(null, true);
  } else {
    cb(new AppError("Not a video, please upload only videos", 400), false);
  }
};

// Export the multer config
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadIntroVideoFile = upload.single("introVideo"); // For uploading single video

exports.uploadSingleVideo = upload.single("video"); // For uploading single video

// Middleware for uploading additional videos
exports.uploadAdditionalVideos = upload.array("videos", 10); // Allow multiple additional videos

exports.getAllCourses = factory.getAll(Course);
exports.getCourse = factory.getOne(Course);
exports.createCourse = factory.createOne(Course);
exports.updateCourse = factory.updateOne(Course);
exports.deleteCourse = factory.deleteOne(Course);

exports.uploadIntroVideo = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload an intro video", 400));
  // console.log(req.userModel);
  if (req.userModel != "Instructor")
    return next(new AppError("You do not have access to this route"));

  // console.log("xx");

  const course = await Course.findById(req.params.id);
  // const updatedCourse = await Course.findByIdAndUpdate(
  //   req.params.id,
  //   { introVideo: `videos/${req.file.filename}` },
  //   { new: true, runValidators: true }
  // );
  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }
  let isInstructor = false;
  console.log(req.instructor);
  // console.log("test ==> ", course.instructors);
  course.instructors.forEach((instructor) => {
    // console.log("ins ==> ", instructor);
    if (instructor == req.instructor);
    isInstructor = true;
  });
  // console.log(isInstructor);

  course.introVideo = `video/${req.file.filename}`;

  await course.save();

  res.status(200).json({
    status: "success",
    data: {
      data: course,
    },
  });
});

exports.addChapter = catchAsync(async (req, res, next) => {
  const { title } = req.body;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  // Add the chapter
  course.chapters.push({ title });
  await course.save();

  res.status(201).json({
    status: "success",
    data: {
      data: course,
    },
  });
});

exports.addVideoToChapter = catchAsync(async (req, res, next) => {
  const { title, description, notes } = req.body;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  const chapter = course.chapters.id(req.params.chapterId);

  if (!chapter) {
    return next(new AppError("No chapter found with that ID", 404));
  }

  // Add the video to the chapter
  chapter.videos.push({
    title,
    description,
    notes,
    videoPath: `videos/${req.file.filename}`,
  });

  await course.save();

  res.status(201).json({
    status: "success",
    data: {
      data: course,
    },
  });
});
