import { Router } from "express";

import { protect }
from "../middleware/authMiddleware";

import { authorizePermission }
from "../middleware/permissionMiddleware";

import {
  allocateEmployee,
}
from "../controllers/allocationController";

const router = Router();

router.post(
  "/",
  protect,
  authorizePermission(
    "CREATE_PROJECT"
  ),
  allocateEmployee
);

export default router;