import express from "express";

import {
 protect
}
from "../middleware/authMiddleware";


import {
 authorizePermission
}
from "../middleware/permissionMiddleware";

import {
getAdminDashboard,
getManagerDashboard,
getEmployeeDashboard
}
from "../controllers/dashboardController";


const router =
express.Router();


router.get(
"/admin",
protect,
authorizePermission(
 "VIEW_REPORTS"
),
getAdminDashboard
);



router.get(
"/manager",
protect,
authorizePermission(
 "VIEW_REPORTS"
),
getManagerDashboard
);



router.get(
"/employee/:employeeId",
protect,
authorizePermission(
 "VIEW_EMPLOYEE"
),
getEmployeeDashboard
);


export default router;