import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "please enter your name"],
    },
    email: {
      type: String,
      required: [true, "please enter email"],
      unique: true,
      validate: validator.isEmail,
    },
    password: {
      type: String,
      required: [true, "please enter your password"],
      select: false,
      minLength: [6, "password must be atleast 6 charecters"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    playlist: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        poster: String,
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: String,
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
