import mongoose from "mongoose";

const statsSchema = new mongoose.Schema(
  {
    users: {
      type: String,
      required: true,
    },
    subscriptions: {
      type: String,
      required: true,
    },
    views: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Stats = mongoose.model("Stats", statsSchema);
