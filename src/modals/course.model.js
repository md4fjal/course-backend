import mongoose from "mongoose";
const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "please enter course title"],
      minLength: [4, "title must be atleast 4 charecters"],
      maxLength: [80, "title cant be exceed of 80 charecters"],
    },
    description: {
      type: String,
      required: [true, "please enter course description"],
      minLength: [20, "title must be atleast 20 charecters"],
    },
    lectures: [
      {
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        video: {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      },
    ],
    poster: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    views: {
      type: Number,
      default: 0,
    },
    numOfVideos: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String,
      required: [true, "Enter course creator Name"],
    },
  },

  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
