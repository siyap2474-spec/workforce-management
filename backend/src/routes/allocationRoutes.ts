import { Router } from "express";

import {
  allocateEmployee,
  updateAllocation,
  cancelAllocation,
  getAllocationHistory,
  getAllocations,
}
from "../controllers/allocationController";

import { protect }
from "../middleware/authMiddleware";

import { authorizePermission }
from "../middleware/permissionMiddleware";
import { validateBody } from "../middleware/validate";


const router = Router();

//get all allocations
router.get(
  "/",
  protect,
  authorizePermission(
    "VIEW_ALLOCATION_HISTORY"
  ),
  getAllocations
);


//create allocation
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_ALLOCATION"
  ),
  validateBody([
    { field: "employeeId", required: true, type: "string" },
    { field: "projectId", required: true, type: "string" },
    { field: "allocationPercentage", required: true, type: "percentage" },
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
  allocateEmployee
);


//update allocation
router.put(
  "/:id",
  protect,
  authorizePermission(
    "UPDATE_ALLOCATION"
  ),
  validateBody([
    { field: "allocationPercentage", required: true, type: "percentage" }
  ]),
  updateAllocation
);


//cancel allocation
router.put(
  "/:id/cancel",
  protect,
  authorizePermission(
    "CANCEL_ALLOCATION"
  ),
  cancelAllocation
);


//history
router.get(
  "/employee/:employeeId",
  protect,
  authorizePermission(
    "VIEW_ALLOCATION_HISTORY"
  ),
  getAllocationHistory
);


export default router;