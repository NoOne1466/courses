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

exports.uploadSingleVideo = upload.single("videoPath"); // For uploading single video

// Middleware for uploading additional videos
// exports.uploadAdditionalVideos = upload.array("videoPath", 10); // Allow multiple additional videos

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
  // console.log(req.instructor);
  course.instructors.forEach((instructor) => {
    // console.log("instrucor ==> ", instructor);
    // console.log("loged in instructor ==>", req.instructor.id);
    if (instructor.toString() === req.instructor.id) isInstructor = true;
  });
  // console.log(isInstructor);

  if (!isInstructor)
    return next(
      new AppError("The instructor is not a partner for this course")
    );

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

  let isInstructor = false;
  course.instructors.forEach((instructor) => {
    if (instructor.toString() === req.instructor.id) isInstructor = true;
  });

  if (!isInstructor)
    return next(
      new AppError("The instructor is not a partner for this course")
    );

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

exports.deleteChapter = catchAsync(async (req, res, next) => {
  const result = await Course.updateOne(
    {
      _id: req.params.courseId,
      instructors: req.instructor.id, // Ensures only an authorized instructor can modify the course
    },
    {
      $pull: { chapters: { _id: req.params.chapterId } }, // Pull the chapter with the matching ID
    }
  );
  console.log(result);
  // Check if the query found and modified any documents
  if (result.modifiedCount === 0) {
    return next(
      new AppError(
        "No chapter found with that ID or you're not authorized to delete it",
        404
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Chapter successfully deleted",
  });
});

exports.addVideoToChapter = catchAsync(async (req, res, next) => {
  const { title, description, notes } = req.body;

  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("No course found with that ID", 404));
  }

  let isInstructor = false;
  course.instructors.forEach((instructor) => {
    if (instructor.toString() === req.instructor.id) isInstructor = true;
  });

  if (!isInstructor)
    return next(
      new AppError("The instructor is not a partner for this course")
    );

  const chapter = course.chapters.id(req.params.chapterId);

  if (!chapter) {
    return next(new AppError("No chapter found with that ID", 404));
  }

  // Add the video to the chapter
  chapter.videos.push({
    title,
    description,
    notes,
    videoPath: `video/${req.file.filename}`,
  });

  await course.save();

  res.status(201).json({
    status: "success",
    data: {
      data: course,
    },
  });
});

exports.deleteVideo = catchAsync(async (req, res, next) => {
  const { courseId, chapterId, videoId } = req.params;

  // Ensure the instructor is authorized to modify the course
  const course = await Course.findOne({
    _id: courseId,
    instructors: req.instructor.id, // Check instructor authorization
  });

  if (!course) {
    return next(
      new AppError("Course not found or you do not have permission", 404)
    );
  }

  // Update course by pulling the video from the specific chapter
  const result = await Course.updateOne(
    {
      _id: courseId,
      "chapters._id": chapterId,
    },
    {
      $pull: { "chapters.$.videos": { _id: videoId } }, // Pull the video with matching ID from the chapter's videos array
    }
  );

  if (result.modifiedCount === 0) {
    return next(new AppError("Video not found in the specified chapter", 404));
  }

  // Send success response
  res.status(204).json({
    status: "success",
    message: "video successfully deleted",
  });
});
