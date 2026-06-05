import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
} from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/refresh-token",refreshAccessToken);

router.post("/logout", logoutUser);

export default router;