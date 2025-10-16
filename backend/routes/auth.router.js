import express from "express";
import { logIn, logOut, signUp } from "../controllers/auth.controller.js";
const authRouter = express.Router();

userRouter.post("/signup", signUp);
userRouter.post("/signin", logIn);
userRouter.get("/logout", logOut);

export default authRouter;
