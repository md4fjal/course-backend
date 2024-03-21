import mongoose from "mongoose";
import { db_name } from "../constants.js";

export const connectDB = async () => {
  try {
    const connInst = await mongoose.connect(
      `${process.env.MONGODB_URI}/${db_name}`
    );
    console.log(`connrction host: ${connInst.connection.host}`);
  } catch (error) {
    console.log("connect interrupted", error);
    process.exit(1);
  }
};
