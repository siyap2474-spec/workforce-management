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


const router =
express.Router();


router.post(
    "/",
    createTimesheet
);


router.get(
    "/employee/:employeeId",
    getMyTimesheets
);


router.put(
    "/:id/submit",
    submitTimesheet
);


router.put(
    "/:id/approve",
    approveTimesheet
);


router.put(
    "/:id/reject",
    rejectTimesheet
);


// Weekly Timesheet
router.get(
    "/weekly/:employeeId",
    getWeeklyTimesheets
);

// Monthly Timesheet
router.get(
    "/monthly/:employeeId",
    getMonthlyTimesheets
);
export default router;


//get pending timesheets for manager
router.get(
"/pending",
getPendingTimesheets
);