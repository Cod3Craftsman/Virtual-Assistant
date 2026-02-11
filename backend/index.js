import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.router.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.router.js";

const app = express();
app.use(
  cors({
    origin: "https://virtual-assistant-359q.onrender.com",
    credentials: true,
  })
);
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());




app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);




connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
