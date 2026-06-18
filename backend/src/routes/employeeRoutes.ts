import { Router } from "express";

import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getProfile,
  updateProfile,
} from "../controllers/employeeController";

import { protect } from "../middleware/authMiddleware";

import { authorizePermission } from "../middleware/permissionMiddleware";
import { validateBody } from "../middleware/validate";

const router = Router();

// get self profile
router.get(
  "/profile",
  protect,
  getProfile
);

// update self profile
router.put(
  "/profile",
  protect,
  authorizePermission("UPDATE_PROFILE"),
  validateBody([
    { field: "name", required: false, type: "string" },
    { field: "phone", required: false, type: "string" },
  ]),
  updateProfile
);

//create employee
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_EMPLOYEE"
  ),
  validateBody([
    { field: "name", required: true, type: "string" },
    { field: "email", required: true, type: "email" },
  ]),
  createEmployee
);

//get employee
router.get(
  "/",
  protect,
  authorizePermission(
    "VIEW_EMPLOYEE"
  ),
  getEmployees
);

//get employee by id
router.get(
  "/:id",
  protect,
  authorizePermission(
    "VIEW_EMPLOYEE"
  ),
  getEmployeeById
);

//update employee
router.put(
  "/:id",
  protect,
  authorizePermission(
    "UPDATE_EMPLOYEE"
  ),
  updateEmployee
);

//delete employee
router.delete(
  "/:id",
  protect,
  authorizePermission(
    "DELETE_EMPLOYEE"
  ),
  deleteEmployee
);

export default router;