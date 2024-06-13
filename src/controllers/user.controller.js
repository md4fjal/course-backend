import { User } from "../modals/users.model.js";
import { Course } from "../modals/course.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.utils.js";
import { sendToken } from "../utils/sendToken.js";
import { sendMail } from "../utils/sendmail.utils.js";
import crypto from "crypto";
import { getDataUri } from "../utils/dataUri.utils.js";
import cloudinary from "cloudinary";
import { Stats } from "../modals/stats.model.js";

// get all users
export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find();
  return res.status(200).json(new ApiResponse(200, "Found All Users", users));
});

// register user
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (
    [name, email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(401, "user already exist");
  }
  const file = req.file;
  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  const createdUser = await User.findById(user._id).select("-password");

  sendToken(res, createdUser, "registered successfully", 201);
});

// login user
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (
    [email, password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(401, "email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(403, "user not registered");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(403, "password is incorrect");
  }

  const loggendInUser = await User.findById(user._id).select("-password");
  if (!loggendInUser) {
    throw new ApiError(403, "facing trouble in login");
  }

  sendToken(res, loggendInUser, `Welcome Back ${user.name}`, 201);
});

// logout user
export const logoutUser = asyncHandler(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      axpires: new Date(Date.now()),
    })
    .json(new ApiResponse(200, "logout successfull"));
});

// get my profile
export const getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  return res.status(200).json(new ApiResponse(200, user, "user found"));
});

// change password
export const changePassword = asyncHandler(async (req, res, next) => {
  const { old_password, new_password } = req.body;
  if (
    [old_password, new_password].some((field) => {
      field?.trim() === "";
    })
  ) {
    throw new ApiError(400, "all fields are required");
  }
  const user = await User.findById(req.user._id).select("+password");

  const isMathch = await user.isPasswordCorrect(old_password);
  if (!isMathch) {
    throw new ApiError(401, "incorrect old password");
  }

  user.password = new_password;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "password changed successfully"));
});

// update profile
export const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "profile updated successfully"));
});

// update profile pic
export const updateProfilePicture = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const file = req.file;
  const fileUri = getDataUri(file);
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  cloudinary.v2.uploader.destroy(user.avatar.public_id);
  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };

  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "profile picrure updated seccessfully"));
});

// forget password
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "no user with this email");
  }

  const resetToken = await user.getResetToken();
  await user.save();

  const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `click on the link to reset your password ${url} if you have not any request please ignore`;

  // send token via mail
  await sendMail(user.email, "Ed tech reset password", message);

  return res
    .status(200)
    .json(new ApiResponse(200, `reset token send to ${user.email}`));
});

// reset password
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.param;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError(402, "token is invalid or has been expire");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "passeword changed successfully"));
});

// add to playlist
export const addToPlaylist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);

  if (!course) {
    throw new ApiError(404, "invalid course id");
  }

  const existeItem = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) {
      return true;
    }
  });

  if (existeItem) {
    throw new ApiError(409, "item already exist");
  }

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  return res.status(200).json(new ApiResponse(200, "Added To Playlist"));
});

// remove from playlist
export const removeFromPlaylist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);

  if (!course) {
    throw new ApiError(404, "invalid course id");
  }

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) {
      return item;
    }
  });
  user.playlist = newPlaylist;
  await user.save();

  return res.status(200).json(new ApiResponse(200, "Removed From Playlist"));
});

// admin controllers
export const AllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json(new ApiResponse(200, users, "all user found"));
});

export const UpdateUserRole = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, "user not found");
  }
  if (user.role === "user") user.role = "admin";
  else user.role = "user";

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, `now you are an ${user.role}`));
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.deleteOne();
  return res
    .status(200)
    .json(new ApiResponse(200, "user deleted successfully"));
});

export const deleteMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.deleteOne();
  return res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json(new ApiResponse(200, "your profile deleted successfully"));
});

User.watch().on("change", async () => {
  const stats = await Stats.find({ createdAt: "desc" }).limit(1);
  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].users = await User.countDocuments();

  stats[0].subscriptions = subscription.length;
  stats[0].createdAt = new Date(Date.now());
  await stats[0].save();
});
