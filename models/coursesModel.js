const mongoose = require("mongoose");

// Define the video subdocument schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A video must have a title"],
  },
  description: String,
  notes: String,
  videoPath: {
    type: String,
    required: [true, "A video must have a file path"],
  },
  watched: {
    type: Boolean,
    default: false,
  },
});
const questionsSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "a quiz must have a question"],
  },
  rightAnswer: {
    type: String,
    required: [true, "a question must has an anwer "],
  },
  answers: [
    {
      type: String,
      required: [true, "a question must has an array of anwers "],
    },
  ],
});
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, "a quiz must have a title"],
  },
  questions: [questionsSchema],
});

// Define the chapter subdocument schema
const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A chapter must have a title"],
  },
  quiz: [quizSchema],
  videos: [videoSchema], // Embed video schema as an array
});

// Define the course schema
const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A course must have a title"],
  },
  description: String,
  introVideo: String, // Path to the intro video
  chapters: [chapterSchema], // Embed chapter schema as an array
  level: {
    type: String,
    required: [true, "A course must have a level"],
  },
  resources: {
    type: String,
  },
  instructors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Instructor",
      required: true,
    },
  ],
  price: {
    type: Number,
    required: [true, "A tour must have a price"],
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

// Create the Course model
const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
