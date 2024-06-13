import { Stats } from "../modals/stats.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { sendMail } from "../utils/sendmail.utils.js";

export const contactForm = asyncHandler(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    throw new ApiError(401, "all fields are required");
  }

  const to = process.env.MY_MAIL;
  const subject = "contact from ed-tech";
  const text = `I am ${name} my email is ${email}. \n ${message}`;

  await sendMail(to, subject, text);

  return res
    .status(200)
    .json(new ApiResponse(200, "Message has benn Sent successfully."));
});

export const courseRequest = asyncHandler(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course) {
    throw new ApiError(401, "all fields are required");
  }
  const to = process.env.MY_MAIL;
  const subject = "request for a course to  ed-tech";
  const text = `I am ${name} my email is ${email}. \n ${course}`;

  await sendMail(to, subject, text);

  return res
    .status(200)
    .json(new ApiResponse(200, "couese request has benn Sent."));
});

export const getAdminStats = asyncHandler(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);
  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.unshift(stats[i]);
  }
  const requiredSize = 12 - statsData.length;

  for (let i = 0; i < requiredSize; i++) {
    statsData.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }
  const usersCount = statsData[11].users;
  const subscriptionsCount = statsData[11].subscriptions;
  const viewsCount = statsData[11].views;

  let usersProfit = true,
    viewsProfit = true,
    subscriptionsProfit = true;

  let usersPercent = 0,
    viewsPercent = 0,
    subscriptionsPercent = 0;

  if (statsData[10].users === 0) usersPercent = usersCount * 100;
  if (statsData[10].views === 0) viewsPercent = viewsCount * 100;
  if (statsData[10].subscriptions === 0)
    subscriptionsPercent = subscriptionsCount * 100;
  else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      views: statsData[11].views - statsData[10].views,
      subscriptions: statsData[11].subscriptions - statsData[10].subscriptions,
    };

    usersPercent = (difference.users / statsData[10].users) * 100;
    viewsPercent = (difference.views / statsData[10].views) * 100;
    subscriptionsPercent =
      (difference.subscriptions / statsData[10].subscriptions) * 100;

    if (usersPercent < 0) usersProfit = false;
    if (viewsPercent < 0) viewsProfit = false;
    if (subscriptionsPercent < 0) subscriptionsProfit = false;
  }

  return res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    subscriptionsCount,
    viewsCount,
    usersProfit,
    viewsProfit,
    subscriptionsProfit,
    usersPercent,
    viewsPercent,
    subscriptionsPercent,
  });
});
