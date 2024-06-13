import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../modals/users.model.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new ApiError(401, "not logged in");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded._id);
  next();
});

export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    throw new ApiError(
      403,
      `${req.user.role} is not allowed to access these resources`
    );
  }

  next();
};

export const authSubscriber = asyncHandler(async (req, res, next) => {
  if (req.user.subscription.status !== "active" && req.user.role !== "admin") {
    throw new ApiError(404, "only subscriber can access the content.");
  }
  next();
});
