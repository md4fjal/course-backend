import mongoose from "mongoose";
import validator from "validator";
const courseSchema = new mongoose.Schema(
  {},

  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
