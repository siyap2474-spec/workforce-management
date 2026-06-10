import express from "express";

import {
    createTimesheet,
    getMyTimesheets,
    submitTimesheet,
    approveTimesheet,
    rejectTimesheet,
    getWeeklyTimesheets,
    getMonthlyTimesheets,
    getPendingTimesheets
} from "../controllers/timesheetController";


import { protect }
from "../middleware/authMiddleware";


import { authorizePermission }
from "../middleware/permissionMiddleware";


const router = express.Router();


// Employee create timesheet
router.post(
    "/",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    createTimesheet
);


// Employee view own timesheets
router.get(
    "/employee/:employeeId",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    getMyTimesheets
);


// Submit timesheet
router.put(
    "/:id/submit",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    submitTimesheet
);


// Manager approve
router.put(
    "/:id/approve",
    protect,
    authorizePermission(
        "REVIEW_TIMESHEET"
    ),
    approveTimesheet
);


// Manager reject
router.put(
    "/:id/reject",
    protect,
    authorizePermission(
        "REVIEW_TIMESHEET"
    ),
    rejectTimesheet
);


// Weekly
router.get(
    "/weekly/:employeeId",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    getWeeklyTimesheets
);


// Monthly
router.get(
    "/monthly/:employeeId",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    getMonthlyTimesheets
);


// Pending for manager
router.get(
    "/pending",
    protect,
    authorizePermission(
        "REVIEW_TIMESHEET"
    ),
    getPendingTimesheets
);


export default router;