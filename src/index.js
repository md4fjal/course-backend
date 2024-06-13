import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connect.db.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";
import nodeCron from "node-cron";
import { Stats } from "./modals/stats.model.js";
const port = process.env.PORT || 3450;

dotenv.config({
  path: "./.env",
});

cloudinary.v2.config({
  cloud_name: "dxeixytc7",
  api_key: "943989283178236",
  api_secret: "Ghb6bzThJejQwr4Pa6LY-D7raoo",
});

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("database connection failed", error);
  });

nodeCron.schedule("0 0 0 1 * *", async () => {
  try {
    await Stats.create({});
  } catch (error) {
    console.log(error);
  }
});
