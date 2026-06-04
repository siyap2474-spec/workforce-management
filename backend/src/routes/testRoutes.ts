import express from "express";
import { protect } from "../middleware/authMiddleware";
import { authorize } from "../middleware/roleMiddleware";
import { authorizePermission } from "../middleware/permissionMiddleware";
const router = express.Router();

router.get(
  "/admin",
  protect,
  authorize("Admin"),
  (req, res) => {
    res.json({
      message: "Welcome Admin",
    });
  }
);

router.get(
  "/create-employee",
  protect,
  authorizePermission("CREATE_EMPLOYEE"),
  (req, res) => {
    res.json({
      message: "Employee creation allowed",
    });
  }
);

export default router;