const catchAsync = require("../utils/catchAsync.js");
const APIFeatures = require("../utils/apiFeatures.js");
const Instructor = require("../models/instructorModel.js");
const factory = require("./handlerFactory.js");

exports.getInstructor = factory.getOne(Instructor); // { path: "reviews" }
exports.getAllInstructors = factory.getAll(Instructor);

// Do NOT update passwords with this!
exports.updateInstructor = factory.updateOne(Instructor);
exports.deleteInstructor = factory.deleteOne(Instructor);
exports.createInstructor = factory.createOne(Instructor);
exports.updateMe = factory.updateMe(Instructor);
exports.deleteMe = factory.deleteMe(Instructor);
exports.getMe = factory.getMe;
exports.homePage = factory.homePage;
