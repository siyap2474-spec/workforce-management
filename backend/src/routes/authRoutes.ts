import { Router } from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshAccessToken,
  logoutUser,
  getRoles,
} from "../controllers/authController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/roles", getRoles);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.post("/refresh-token",refreshAccessToken);

router.post(
  "/logout",
  protect,
  logoutUser
);

export default router;