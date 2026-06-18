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
import { validateBody, validateQuery } from "../middleware/validate";


const router = express.Router();


// Employee create timesheet
router.post(
    "/",
    protect,
    authorizePermission(
        "SUBMIT_TIMESHEET"
    ),
    validateBody([
        { field: "employeeId", required: true, type: "string" },
        { field: "date", required: true, type: "date" },
        {
            field: "projects",
            required: true,
            type: "array",
            custom: (val) => {
                if (!Array.isArray(val) || val.length === 0) {
                    return "Projects must be a non-empty array";
                }
                let sum = 0;
                for (let i = 0; i < val.length; i++) {
                    const item = val[i];
                    if (!item || typeof item !== "object") {
                        return `Project entry at index ${i} is invalid`;
                    }
                    if (!item.project) {
                        return `Project ID is required for entry at index ${i}`;
                    }
                    if (typeof item.hours !== "number" || item.hours <= 0) {
                        return `Hours must be a positive number for entry at index ${i}`;
                    }
                    sum += item.hours;
                }
                if (sum > 24) {
                    return "Total hours cannot exceed 24 hours";
                }
                return null;
            }
        }
    ]),
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
    validateQuery([
        { field: "startDate", required: true, type: "date" },
        {
            field: "endDate",
            required: true,
            type: "date",
            custom: (val, req) => {
                if (req.query.startDate && new Date(val as string) <= new Date(req.query.startDate as string)) {
                    return "End date must be after start date";
                }
                return null;
            }
        }
    ]),
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