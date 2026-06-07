import { Request, Response } from "express";
import Allocation from "../models/Allocation";
import Employee from "../models/Employee";
import Project from "../models/Project";

//create allocation

export const allocateEmployee =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {

      const {
        employeeId,
        projectId,
        allocationPercentage,
        startDate,
        endDate,
      } = req.body;

      const employee =
        await Employee.findById(
          employeeId
        );

//business logic employee on leave validation

if (employee?.isOnLeave) {
  res.status(400).json({
    message:
      "Employee is currently on leave",
  });

  return;
}

      if (!employee) {
        res.status(404).json({
          message:
            "Employee not found",
        });
        return;
      }

      const project =
        await Project.findById(
          projectId
        );

      if (!project) {
        res.status(404).json({
          message:
            "Project not found",
        });
        return;
      }

      //business logic end date start date

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

      const allocation =
        await Allocation.create({
          employee: employeeId,
          project: projectId,
          allocationPercentage,
          startDate,
          endDate,
        });

      res.status(201).json(
        allocation
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  };