import { Request, Response } from "express";
import Employee from "../models/Employee";
import Allocation from "../models/Allocation";


export const getResourceAvailability =
    async (
        req: Request,
        res: Response
    ): Promise<void> => {

        try {

            const employees =
                await Employee.find();


            const allocations =
                await Allocation.find({
                    status: "Active",
                });

            const availableResources: any[] = [];
            const partiallyAllocatedResources: any[] = [];
            const fullyAllocatedResources: any[] = [];
            const employeesOnLeave: any[] = [];

            for (const employee of employees) {


                if (employee.isOnLeave) {

                    employeesOnLeave.push({
                        name: employee.name,
                        email: employee.email
                    });

                    continue;
                }

                const employeeAllocations =
                    allocations.filter(
                        (allocation) =>
                            allocation.employee.toString()
                            === employee._id.toString()
                    );


                const utilization =
                    employeeAllocations.reduce(
                        (total, allocation) =>
                            total +
                            allocation.allocationPercentage,
                        0
                    );


                const available =
                    100 - utilization;

                const data = {

                    employeeId:
                        employee._id,

                    name:
                        employee.name,

                    utilization,

                    available

                };

                if (utilization === 0) {

                    availableResources.push(data);

                }
                else if (
                    utilization < 100
                ) {

                    partiallyAllocatedResources.push(data);

                }
                else {

                    fullyAllocatedResources.push(data);

                }


            }

            res.status(200).json({

                availableResources,

                partiallyAllocatedResources,

                fullyAllocatedResources,

                employeesOnLeave

            });

        }
        catch (error) {

            console.error(error);
            res.status(500).json({
                message:
                    "Server Error"
            });
        }
    };