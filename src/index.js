import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./db/connect.db.js";

const port = process.env.PORT || 3450;

dotenv.config({
  path: "./.env",
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
