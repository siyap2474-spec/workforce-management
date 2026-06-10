import { Router } from "express";

import {
  allocateEmployee,
  updateAllocation,
  cancelAllocation,
  getAllocationHistory,
}
from "../controllers/allocationController";

import { protect }
from "../middleware/authMiddleware";

import { authorizePermission }
from "../middleware/permissionMiddleware";


const router = Router();


//create allocation
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_ALLOCATION"
  ),
  allocateEmployee
);


//update allocation
router.put(
  "/:id",
  protect,
  authorizePermission(
    "UPDATE_ALLOCATION"
  ),
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