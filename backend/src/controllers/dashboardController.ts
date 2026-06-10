import { Request, Response } from "express";

import Employee from "../models/Employee";
import Project from "../models/Project";
import Allocation from "../models/Allocation";
import Timesheet from "../models/Timesheet";
import Leave from "../models/Leave";


// ADMIN DASHBOARD

export const getAdminDashboard =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const totalEmployees =
                await Employee.countDocuments();

            const activeProjects =
                await Project.countDocuments({
                    status: "Active"
                });

            const resourcesAllocated =
                await Allocation.countDocuments({
                    status: "Active"
                });

            const employeesOnLeave =
                await Employee.countDocuments({
                    isOnLeave: true
                });

            // department chart

            const departmentDistribution =
                await Employee.aggregate([

                    {
                        $group: {
                            _id: "$department",
                            count: {
                                $sum: 1
                            }
                        }
                    }

                ]);

            // utilization chart

            const resourceUtilization =
                await Allocation.find({
                    status: "Active"
                })
                    .populate(
                        "employee",
                        "name"
                    );

            res.status(200).json({

                cards: {
                    totalEmployees,
                    activeProjects,
                    resourcesAllocated,
                    employeesOnLeave
                },


                charts: {
                    departmentDistribution,
                    resourceUtilization
                }

            });

        }
        catch (error) {

            console.error(error);

            res.status(500).json({
                message: "Server Error"
            });

        }

    };

// MANAGER DASHBOARD

export const getManagerDashboard =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {


            const projects =
                await Allocation.find({
                    status: "Active"
                })
                    .populate(
                        "project",
                        "name"
                    );

            const assignedResources =
                await Allocation.countDocuments({
                    status: "Active"
                });

            const pendingTimesheets =
                await Timesheet.countDocuments({
                    status: "Submitted"
                });

            const pendingLeaves =
                await Leave.countDocuments({
                    status: "Pending"
                });

            res.status(200).json({

                myProjects: projects,

                assignedResources,

                pendingTimesheets,

                pendingLeaves

            });

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });

        }

    };

// EMPLOYEE DASHBOARD

export const getEmployeeDashboard =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {


            const {
                employeeId
            } = req.params;



            const employee =
                await Employee.findById(
                    employeeId
                );


            if (!employee) {

                res.status(404).json({
                    message: "Employee not found"
                });

                return;
            }

            const currentProjects =
                await Allocation.find({

                    employee: employeeId,

                    status: "Active"

                })
                    .populate(
                        "project",
                        "name"
                    );

            const monthlyHours =
                await Timesheet.aggregate([

                    {
                        $match: {
                            employee: employee._id
                        }
                    },

                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: "$totalHours"
                            }
                        }
                    }

                ]);

            res.status(200).json({

                currentProjects,

                leaveBalance: {
                    casual: employee.casualLeaveBalance,
                    sick: employee.sickLeaveBalance,
                    earned: employee.earnedLeaveBalance
                },

                monthlyHours:
                    monthlyHours[0]?.total || 0

            });

        }
        catch (error) {

            res.status(500).json({
                message: "Server Error"
            });

        }

    };