const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A course must have a title"],
  },
  description: {
    type: String,
    required: [true, "A course must have a description"],
  },
  instructors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
  ],
  introVideo: {
    type: String,
    // required: [true, "A course must have an intro video"],
  },
  videos: [
    {
      type: String,
    },
  ],
  price: {
    type: Number,
    required: [true, "A course must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Course = mongoose.model("Course", courseSchema);
module.exports = Course;
