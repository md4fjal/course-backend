import { Router } from "express";
import { getAllCourses } from "../controllers/course.controller.js";

const router = Router();

router.route("/courses").get(getAllCourses);

export default router;
