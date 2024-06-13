import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
import { ErrorHandler } from "./middlewares/ErrorHandler.middleware.js";
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(cookieParser());

// importing courses routes
import courseRouter from "./routes/course.route.js";
app.use("/api/v1", courseRouter);

// importing user routes

import userRouter from "./routes/user.route.js";
app.use("/api/v1", userRouter);

// importing payment routes

import paymentRouter from "./routes/payment.route.js";
app.use("/api/v1", paymentRouter);

// import other routes

import otherRouter from "./routes/other.route.js";
app.use("/api/v1", otherRouter);

export default app;

app.use(ErrorHandler);
