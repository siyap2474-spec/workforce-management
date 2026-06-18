import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import Leave from "../models/Leave";
import Employee from "../models/Employee";
import Allocation from "../models/Allocation";
import mongoose from "mongoose";

//Apply Leave
export const applyLeave =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const {
                employeeId,
                leaveType,
                startDate,
                endDate,
                reason,
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

            if (
                new Date(endDate)
                <=
                new Date(startDate)
            ) {
                res.status(400).json({
                    message:
                        "End date must be after start date",
                });

                return;
            }

            const leave =
                await Leave.create({
                    employee: employeeId,
                    leaveType,
                    startDate,
                    endDate,
                    reason,
                });

            res.status(201).json(
                leave
            );

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server Error",
            });
        }
    };

//get all leaves
export const getAllLeaves =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
            const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;
            const paginationFormat = req.query.paginationFormat as string;

            if (page && limit && page > 0 && limit > 0) {
                const skip = (page - 1) * limit;
                const total = await Leave.countDocuments();
                const leaves = await Leave.find()
                    .populate("employee", "name email")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit);

                res.setHeader("X-Total-Count", total.toString());
                res.setHeader("X-Total-Pages", Math.ceil(total / limit).toString());
                res.setHeader("X-Current-Page", page.toString());
                res.setHeader("X-Limit", limit.toString());

                if (paginationFormat === "json") {
                    res.status(200).json({
                        total,
                        pages: Math.ceil(total / limit),
                        currentPage: page,
                        limit,
                        data: leaves,
                    });
                    return;
                }
                res.status(200).json(leaves);
                return;
            }

            const leaves =
                await Leave.find()
                    .populate(
                        "employee",
                        "name email"
                    )
                    .sort({
                        createdAt: -1,
                    });

            res.status(200).json(
                leaves
            );

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server Error",
            });
        }
    };

//get employee's own leaves
export const getMyLeaves =
    async (
        req: AuthRequest,
        res: Response
    ): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({
                    message: "Not authorized",
                });
                return;
            }

            const employee =
                await Employee.findOne({
                    user: req.user._id,
                });

            if (!employee) {
                res.status(404).json({
                    message: "Employee profile not found",
                });
                return;
            }

            const leaves =
                await Leave.find({
                    employee: employee._id,
                })
                    .populate(
                        "employee",
                        "name email"
                    )
                    .populate(
                        "replacementEmployee",
                        "name email"
                    )
                    .sort({
                        createdAt: -1,
                    });

            res.status(200).json(
                leaves
            );

        } catch (error) {
            console.error(error);
            res.status(500).json({
                message: "Server Error",
            });
        }
    };

//Approve Leave
export const approveLeave =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const leave =
                await Leave.findById(
                    req.params.id
                );



            if (!leave) {
                res.status(404).json({
                    message:
                        "Leave request not found",
                });

                return;
            }

            if (
                leave.status !== "Pending"
            ) {
                res.status(400).json({
                    message:
                        "Leave request already processed",
                });

                return;
            }
            const employee =
                await Employee.findById(
                    leave.employee
                );

            if (!employee) {
                res.status(404).json({
                    message:
                        "Employee not found",
                });

                return;
            }

            const {
                replacementEmployeeId,
            } = req.body;

            const allocations =
                await Allocation.find({
                    employee: employee._id,
                    status: "Active",
                }).populate("project");

            const hasCriticalProject =
                allocations.some(
                    (allocation: any) =>
                        allocation.project
                            ?.isCriticalProject === true
                );

            if (
                hasCriticalProject &&
                !replacementEmployeeId
            ) {
                res.status(400).json({
                    message:
                        "Replacement employee required for critical project",
                });

                return;
            }

            if (replacementEmployeeId) {
                if (!mongoose.Types.ObjectId.isValid(replacementEmployeeId)) {
                    res.status(400).json({
                        message: "Invalid replacement employee ID format",
                    });
                    return;
                }

                if (replacementEmployeeId === leave.employee.toString()) {
                    res.status(400).json({
                        message: "An employee cannot be their own replacement",
                    });
                    return;
                }

                const replacementEmployee = await Employee.findById(replacementEmployeeId);
                if (!replacementEmployee) {
                    res.status(404).json({
                        message: "Replacement employee not found",
                    });
                    return;
                }

                if (replacementEmployee.isOnLeave) {
                    res.status(400).json({
                        message: "Replacement employee is currently on leave",
                    });
                    return;
                }
            }

            if (
                leave.leaveType === "Casual"
            ) {

                if (
                    employee.casualLeaveBalance <= 0
                ) {
                    res.status(400).json({
                        message:
                            "No casual leave balance remaining",
                    });

                    return;
                }

                employee.casualLeaveBalance -= 1;
            }

            if (
                leave.leaveType === "Sick"
            ) {

                if (
                    employee.sickLeaveBalance <= 0
                ) {
                    res.status(400).json({
                        message:
                            "No sick leave balance remaining",
                    });

                    return;
                }

                employee.sickLeaveBalance -= 1;
            }

            if (
                leave.leaveType === "Earned"
            ) {

                if (
                    employee.earnedLeaveBalance <= 0
                ) {
                    res.status(400).json({
                        message:
                            "No earned leave balance remaining",
                    });

                    return;
                }

                employee.earnedLeaveBalance -= 1;
            }

            if (
                replacementEmployeeId
            ) {
                leave.replacementEmployee =
                    replacementEmployeeId;
            }

            leave.status = "Approved";

            employee.isOnLeave = true;
            employee.leaveEndDate = leave.endDate;

            await leave.save();
            await employee.save();

            res.status(200).json({
                message:
                    "Leave approved successfully",
                leave,
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server Error",
            });
        }
    };

//Reject Leave
export const rejectLeave =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {

            const leave =
                await Leave.findById(
                    req.params.id
                );

            if (!leave) {
                res.status(404).json({
                    message:
                        "Leave request not found",
                });

                return;
            }

            if (
                leave.status !== "Pending"
            ) {
                res.status(400).json({
                    message:
                        "Leave request already processed",
                });

                return;
            }

            leave.status =
                "Rejected";

            await leave.save();

            res.status(200).json({
                message:
                    "Leave rejected successfully",
                leave,
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                message: "Server Error",
            });
        }
    };

// Leave Calendar
export const getLeaveCalendar =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const leaves =
                await Leave.find({
                    status: "Approved",
                })
                    .populate(
                        "employee",
                        "name email"
                    )
                    .sort({
                        startDate: 1,
                    });


            res.status(200).json(
                leaves
            );


        } catch (error) {

            console.error(error);

            res.status(500).json({
                message:
                    "Server Error",
            });
        }
    };

// Get Leave Balance
export const getLeaveBalance =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const employee =
                await Employee.findById(
                    req.params.employeeId
                );


            if (!employee) {

                res.status(404).json({
                    message:
                        "Employee not found",
                });

                return;
            }


            res.status(200).json({

                employee:
                    employee.name,

                leaveBalance: {

                    casualLeaveBalance:
                        employee.casualLeaveBalance,

                    sickLeaveBalance:
                        employee.sickLeaveBalance,

                    earnedLeaveBalance:
                        employee.earnedLeaveBalance

                }

            });


        } catch (error) {

            console.error(error);


            res.status(500).json({
                message:
                    "Server Error",
            });

        }

    };

