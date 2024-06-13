import { Course } from "../modals/course.model.js";
import { Stats } from "../modals/stats.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { getDataUri } from "../utils/dataUri.utils.js";
import cloudinary from "cloudinary";

// get all courses
export const getAllCourses = asyncHandler(async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const category = req.query.category || "";

  const courses = await Course.find({
    title: {
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }).select("-lectures");
  return res
    .status(200)
    .json(new ApiResponse(200, "all courses found", courses));
});

// create course
export const createCourse = asyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;
  if (
    [title, description, category, createdBy].some((fields) => {
      fields?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }
  const file = req.file;
  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        "course created successfully. now you can add the lectures"
      )
    );
});

//  get course lectures
export const getCourseLectures = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new ApiError(404, "course not found");
  }

  course.views += 1;
  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { lectures: course.lectures }));
});

// add lectures
export const addCourseLectures = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const { id } = req.params;
  const file = req.file;
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  const course = await Course.findById(id);

  if (!course) {
    throw new ApiError(404, "course not found");
  }

  // upload file here

  course.lectures.push({
    title,
    description,
    video: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  course.numOfVideos = course.lectures.length;
  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, course, "lecture added successfully"));
});

// delete lecture

export const deleteCourse = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(404, "course not found");
  }

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
  }

  await course.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "course deleted successfully!"));
});

export const deleteLecture = asyncHandler(async (req, res, next) => {
  const { courseId, lectureId } = req.query;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(400, "course not found");
  }

  const lecture = course.lectures.find((item) => {
    if (item._id.toString() === lectureId.toString()) {
      return item;
    }
  });

  await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
    resource_type: "video",
  });

  course.lectures = course.lectures.filter((item) => {
    if (item._id.toString() !== lectureId.toString()) {
      return item;
    }
  });

  course.numOfVideos = course.lectures.length;

  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "lecture deleted successfully"));
});
// get course lectures

Course.watch().on("change", async () => {
  const stats = await Stats.find({ createdAt: "desc" }).limit(1);
  const courses = await Course.find({});
  totalViews = 0;
  for (let i = 0; i < courses.length; i++) {
    totalViews += courses[i].views;
  }

  stats[0].views = totalViews;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
