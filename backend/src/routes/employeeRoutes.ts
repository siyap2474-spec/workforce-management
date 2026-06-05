import { Router } from "express";

import { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee} from "../controllers/employeeController";

import { protect } from "../middleware/authMiddleware";

import { authorizePermission } from "../middleware/permissionMiddleware";

const router = Router();

//create employee
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_EMPLOYEE"
  ),
  createEmployee
);

//get employee
router.get(
  "/",
  protect,
  getEmployees
);

//get employee by id
router.get(
  "/:id",
  protect,
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