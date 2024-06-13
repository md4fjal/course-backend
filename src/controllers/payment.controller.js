import { User } from "../modals/users.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { instance } from "../index.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { Payment } from "../modals/payment.model.js";

export const buySubscripption = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (user.role === "admin") throw new ApiError(403, "admin cant subscribe");

  const plan_id = process.env.PLAN_ID || "plan_OJiOSjXc4j3jyb";

  const subscription = await instance.subscriptions.create({
    plan_id: "plan_OJiOSjXc4j3jyb",
    customer_notify: 1,
    total_count: 12,
  });

  user.subscription.id = subscription.id;
  user.subscription.status = subscription.status;

  await user.save();
  return res
    .status(201)
    .json(new ApiResponse(201, "payment successful.", subscription.id));
});

export const paymentVerification = asyncHandler(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
    req.body;
  const user = await User.findById(req.user._id);
  const subscription_id = user.subscription.id;

  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
    .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
    .digest("hex");

  const isAuthentic = generated_signature === razorpay_signature;

  if (!isAuthentic)
    return res.redirect(`${process.env.FRONTEND_URL}/paymentfailed`);

  await Payment.create({
    razorpay_payment_id,
    razorpay_subscription_id,
    razorpay_signature,
  });

  user.subscription.status = "active";
  await user.save();

  return res.redirect(
    `${process.env.FRONTEND_URL}/PaymentSuccess?reference=${razorpay_payment_id}`
  );
});

export const getRazorpayKey = asyncHandler(async (req, res, next) => {
  return res
    .status(200)
    .json({ success: true, key: process.env.RAZORPAY_API_KEY });
});

export const cencleSubscription = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const subscription_id = user.subscription.id;
  let refund = false;

  instance.subscriptions.cancel({ subscription_id });

  const payment = await Payment.findOne({
    razorpay_subscription_id: subscription_id,
  });

  const gap = Date.now() - payment.createdAt;

  const refund_time = process.env.REFUND_DAYS * 24 * 60 * 60 * 1000;

  if (refund_time > gap) {
    instance.payments.refund(payment.razorpay_payment_id);
    refund = true;
  }

  await payment.deleteOne();

  user.subscription.id = undefined;
  user.subscription.status = undefined;
  await user.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        refund
          ? "payment would be refund within 7 working days"
          : "no refund after 10 days"
      )
    );
});
