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
});

// Define the chapter subdocument schema
const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A chapter must have a title"],
  },
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
