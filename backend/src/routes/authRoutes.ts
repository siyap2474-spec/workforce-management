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
import { validateBody } from "../middleware/validate";

const router = Router();

router.get("/roles", getRoles);

router.post(
  "/register",
  validateBody([
    { field: "name", required: true, type: "string" },
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, type: "password" },
    { field: "phone", required: true, type: "string" },
    { field: "department", required: true, type: "string" },
  ]),
  registerUser
);

router.post(
  "/login",
  validateBody([
    { field: "email", required: true, type: "email" },
    { field: "password", required: true, type: "string" },
  ]),
  loginUser
);

router.get("/verify-email/:token", verifyEmail);

router.post(
  "/forgot-password",
  validateBody([
    { field: "email", required: true, type: "email" }
  ]),
  forgotPassword
);

router.post(
  "/reset-password/:token",
  validateBody([
    { field: "password", required: true, type: "password" }
  ]),
  resetPassword
);

router.post("/refresh-token", refreshAccessToken);

router.post(
  "/logout",
  protect,
  logoutUser
);

export default router;