import { Request, Response } from "express";
import Timesheet from "../models/Timesheet";
import Employee from "../models/Employee";


// Create Timesheet
export const createTimesheet =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const {
                employeeId,
                date,
                projects,
            } = req.body;


            const employee =
                await Employee.findById(
                    employeeId
                );


            if (!employee) {

                res.status(404).json({
                    message:
                        "Employee not found",
                });

                return;
            }


            let totalHours = 0;


            projects.forEach(
                (item: any) => {

                    totalHours +=
                        item.hours;

                }
            );


            if (totalHours > 24) {

                res.status(400).json({
                    message:
                        "Total hours cannot exceed 24 hours",
                });

                return;
            }


            const timesheet =
                await Timesheet.create({

                    employee: employeeId,

                    date,

                    projects,

                    totalHours,

                });


            res.status(201).json(
                timesheet
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });

        }
    };

// Get Employee Timesheets
export const getMyTimesheets =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const {
                employeeId
            } = req.params;


            const timesheets =
                await Timesheet.find({
                    employee: employeeId,
                })
                    .populate(
                        "projects.project",
                        "name"
                    )
                    .sort({
                        date: -1,
                    });


            res.status(200).json(
                timesheets
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });
        }
    };

//Submit Timesheet
export const submitTimesheet =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const timesheet =
                await Timesheet.findById(
                    req.params.id
                );


            if (!timesheet) {

                res.status(404).json({
                    message:
                        "Timesheet not found",
                });

                return;
            }


            if (
                timesheet.status !== "Draft"
            ) {

                res.status(400).json({
                    message:
                        "Timesheet already processed",
                });

                return;
            }


            timesheet.status =
                "Submitted";


            await timesheet.save();


            res.status(200).json({
                message:
                    "Timesheet submitted successfully",

                timesheet,
            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });

        }

    };

//approve Timesheet
export const approveTimesheet =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const timesheet =
                await Timesheet.findById(
                    req.params.id
                );


            if (!timesheet) {

                res.status(404).json({
                    message:
                        "Timesheet not found",
                });

                return;
            }


            if (
                timesheet.status !== "Submitted"
            ) {

                res.status(400).json({
                    message:
                        "Only submitted timesheet can be approved",
                });

                return;
            }


            timesheet.status =
                "Approved";


            await timesheet.save();


            res.status(200).json({

                message:
                    "Timesheet approved successfully",

                timesheet,

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });

        }

    };

//reject Timesheet
export const rejectTimesheet =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const timesheet =
                await Timesheet.findById(
                    req.params.id
                );


            if (!timesheet) {

                res.status(404).json({
                    message:
                        "Timesheet not found",
                });

                return;
            }


            if (
                timesheet.status !== "Submitted"
            ) {

                res.status(400).json({
                    message:
                        "Only submitted timesheet can be rejected",
                });

                return;
            }


            timesheet.status =
                "Rejected";


            await timesheet.save();


            res.status(200).json({

                message:
                    "Timesheet rejected successfully",

                timesheet,

            });


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });

        }

    };

// Weekly Timesheet Report
export const getWeeklyTimesheets =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const {
                employeeId
            } = req.params;


            const {
                startDate,
                endDate
            } = req.query;



            const timesheets =
                await Timesheet.find({

                    employee: employeeId,

                    date: {
                        $gte: new Date(startDate as string),
                        $lte: new Date(endDate as string)
                    }

                })
                    .populate(
                        "projects.project",
                        "name"
                    );



            let totalHours = 0;


            timesheets.forEach(
                (item) => {

                    totalHours += item.totalHours;

                }
            );



            res.status(200).json({

                period: {
                    startDate,
                    endDate
                },

                totalHours,

                timesheets

            });



        } catch (error) {

            console.error(error);


            res.status(500).json({

                message: "Server Error"

            });

        }

    };

// Monthly Timesheet Report
export const getMonthlyTimesheets =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {


        try {


            const {
                employeeId
            } = req.params;



            const {
                year,
                month
            } = req.query;



            const startDate =
                new Date(
                    Number(year),
                    Number(month) - 1,
                    1
                );



            const endDate =
                new Date(
                    Number(year),
                    Number(month),
                    0
                );



            const timesheets =
                await Timesheet.find({

                    employee: employeeId,


                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }


                })
                    .populate(
                        "projects.project",
                        "name"
                    );




            let totalHours = 0;



            timesheets.forEach(
                (item) => {

                    totalHours += item.totalHours;

                }
            );



            res.status(200).json({

                month,

                year,

                totalHours,

                timesheets

            });



        } catch (error) {


            console.error(error);



            res.status(500).json({

                message: "Server Error"

            });


        }


    };

// Get Pending Timesheets For Manager
export const getPendingTimesheets =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {
            const timesheets =
                await Timesheet.find({

                    status: "Submitted"

                })
                    .populate(
                        "employee",
                        "name email"
                    )
                    .populate(
                        "projects.project",
                        "name"
                    )
                    .sort({
                        date: -1
                    });

            res.status(200).json({

                count: timesheets.length,

                timesheets

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                message: "Server Error"

            });
        }
    };

