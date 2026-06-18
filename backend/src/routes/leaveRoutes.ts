import express from "express";

console.log("LEAVE ROUTE FILE LOADED");

import {
  applyLeave,
  getAllLeaves,
  getMyLeaves,
  approveLeave,
  rejectLeave,
  getLeaveCalendar,
  getLeaveBalance
} from "../controllers/leaveController";


import { protect }
from "../middleware/authMiddleware";


import { authorizePermission }
from "../middleware/permissionMiddleware";
import { validateBody } from "../middleware/validate";


const router = express.Router();


// Employee apply leave
router.post(
  "/",
  protect,
  authorizePermission(
    "APPLY_LEAVE"
  ),
  validateBody([
    { field: "employeeId", required: true, type: "string" },
    { 
      field: "leaveType", 
      required: true, 
      custom: (val) => {
        if (!["Casual", "Sick", "Earned"].includes(val)) {
          return "Leave type must be one of: Casual, Sick, Earned";
        }
        return null;
      } 
    },
    { field: "startDate", required: true, type: "date" },
    { 
      field: "endDate", 
      required: true, 
      type: "date",
      custom: (val, req) => {
        if (req.body.startDate && new Date(val) <= new Date(req.body.startDate)) {
          return "End date must be after start date";
        }
        return null;
      }
    },
  ]),
  applyLeave
);


// Admin/Manager view leaves
router.get(
  "/",
  protect,
  authorizePermission(
    "VIEW_LEAVES"
  ),
  getAllLeaves
);

// Employee view self leaves
router.get(
  "/my-leaves",
  protect,
  getMyLeaves
);


// Manager approve
router.put(
  "/:id/approve",
  protect,
  authorizePermission(
    "APPROVE_LEAVE"
  ),
  approveLeave
);


// Manager reject
router.put(
  "/:id/reject",
  protect,
  authorizePermission(
    "REJECT_LEAVE"
  ),
  rejectLeave
);


// Calendar
router.get(
  "/calendar",
  protect,
  authorizePermission(
    "VIEW_LEAVE_CALENDAR"
  ),
  getLeaveCalendar
);


// Leave Balance
router.get(
  "/balance/:employeeId",
  protect,
  authorizePermission("VIEW_EMPLOYEE"),
  getLeaveBalance
);




export default router;