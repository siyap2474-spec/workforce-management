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
 getUtilizationReport,
 getProjectReport,
 getLeaveReport
}
from "../controllers/reportController";


const router =
express.Router();


router.get(
"/utilization",
protect,
authorizePermission(
 "VIEW_REPORTS"
),
getUtilizationReport
);



router.get(
"/projects",
protect,
authorizePermission(
 "VIEW_REPORTS"
),
getProjectReport
);



router.get(
"/leaves",
protect,
authorizePermission(
 "VIEW_REPORTS"
),
getLeaveReport
);

export default router;