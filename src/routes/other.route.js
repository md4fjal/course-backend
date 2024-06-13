import { Router } from "express";
import {
  authorizeAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware.js";
import {
  contactForm,
  courseRequest,
  getAdminStats,
} from "../controllers/other.controller.js";

const router = Router();

// contact
router.route("/contact").post(contactForm);

// course request
router.route("/courserequest").post(courseRequest);

// get admin dashboard stats
router
  .route("/admin/stats")
  .get(isAuthenticated, authorizeAdmin, getAdminStats);

export default router;
