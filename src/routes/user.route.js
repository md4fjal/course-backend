import { Router } from "express";
import {
  getAllUsers,
  getMyProfile,
  loginUser,
  logoutUser,
  registerUser,
  changePassword,
  updateProfile,
  updateProfilePicture,
  forgetPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlaylist,
  AllUsers,
  UpdateUserRole,
  deleteUser,
  deleteMyProfile,
} from "../controllers/user.controller.js";
import {
  authorizeAdmin,
  isAuthenticated,
} from "../middlewares/auth.middleware.js";
import { singleUpload } from "../middlewares/multer.middleware.js";

const router = Router();

// all user
router.route("/users").get(getAllUsers);

// register user
router.route("/register").post(singleUpload, registerUser);

// login
router.route("/login").post(loginUser);

//logout
router.route("/logout").get(logoutUser);

// get my profile
router.route("/me").get(isAuthenticated, getMyProfile);

router.route("/me").delete(isAuthenticated, deleteMyProfile);

// change my password
router.route("/changepassword").put(isAuthenticated, changePassword);

// update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile);

// update profile pic
router
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilePicture);

// forget password
router.route("/forgetpassword").post(forgetPassword);

// reset password
router.route("/resetpassword/:token").put(resetPassword);

// addtoplaylist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist);

// removefromplaylist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist);

// Admin Routes
// get all users
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, AllUsers);

router
  .route("/admin/user/:id")
  .put(isAuthenticated, authorizeAdmin, UpdateUserRole) // change user role
  .delete(isAuthenticated, authorizeAdmin, deleteUser); // delete user

export default router;
