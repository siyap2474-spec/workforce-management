import { Router } from "express";

import { protect }
from "../middleware/authMiddleware";

import { authorizePermission }
from "../middleware/permissionMiddleware";

import {
  allocateEmployee,
  updateAllocation,
  cancelAllocation,
  getAllocationHistory,
}
from "../controllers/allocationController";

const router = Router();

//allocate employee
router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_PROJECT"
  ),
  allocateEmployee
);

//update allocation
router.put(
  "/:id",
  protect,
  updateAllocation
);

//cancel allocation
router.put(
  "/:id/cancel",
  protect,
  cancelAllocation
);

//get allocation history
router.get(
  "/employee/:employeeId",
  protect,
  getAllocationHistory
);

export default router;