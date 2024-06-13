import { Router } from "express";
import {
  createCourse,
  getAllCourses,
  getCourseLectures,
  addCourseLectures,
  deleteCourse,
  deleteLecture,
} from "../controllers/course.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js";
import {
  authSubscriber,
  authorizeAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/courses").get(getAllCourses);

router
  .route("/create_course")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

router
  .route("/courses/:id")
  .get(isAuthenticated, authSubscriber, getCourseLectures)
  .post(isAuthenticated, authorizeAdmin, singleUpload, addCourseLectures)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

router
  .route("/lectures")
  .delete(isAuthenticated, authorizeAdmin, deleteLecture);

export default router;
