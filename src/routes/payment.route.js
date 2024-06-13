import { Router } from "express";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import {
  buySubscripption,
  cencleSubscription,
  getRazorpayKey,
  paymentVerification,
} from "../controllers/payment.controller.js";

const router = Router();
// buy subscription
router.route("/subscribe").get(isAuthenticated, buySubscripption);

// verify payment and save reference inn database
router.route("/paymentverification").post(isAuthenticated, paymentVerification);

// get razorpay key

router.route("/getrazorpaykey").get(getRazorpayKey);

// cencle subscription

router.route("/subscribe/cencle").delete(isAuthenticated, cencleSubscription);

export default router;
