import { Router } from "express";
import { registerUser, loginUser, getMe, logoutUser } from "../controllers/auth.controller.js";
import {validateRegister,validateLogin} from "../validators/auth.validator.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRoutes = Router();

authRoutes.post("/register",validateRegister,registerUser)

// authRoutes.get("/verify-email",verifyEmail)

authRoutes.post("/login",validateLogin,loginUser)

authRoutes.get("/me",authMiddleware,getMe)

authRoutes.post("/logout", logoutUser)

export default authRoutes;