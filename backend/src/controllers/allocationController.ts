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

if (!employee) {
  res.status(404).json({
    message:
      "Employee not found",
  });

  return;
}


// Auto reset leave status after leave end date

if (
  employee.isOnLeave &&
  employee.leaveEndDate &&
  new Date() > employee.leaveEndDate
) {

  employee.isOnLeave = false;
  employee.leaveEndDate = undefined;

  await employee.save();
}


// Check current leave status

if (employee.isOnLeave) {

  res.status(400).json({
    message:
      "Employee is currently on leave",
  });

  return;
}

//existing Allocation
const existingAllocations =
  await Allocation.find({
    employee: employeeId,
    status: "Active",
  });

const currentAllocation =
  existingAllocations.reduce(
    (total, allocation) =>
      total +
      allocation.allocationPercentage,
    0
  );

if (
  currentAllocation +
    allocationPercentage >
  100
) {
  res.status(400).json({
    message:
      "Total allocation cannot exceed 100%",
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

//create allocation
      const allocation =
        await Allocation.create({
          employee: employeeId,
          project: projectId,
          allocationPercentage,
          startDate,
          endDate,
        });

      // Synchronize Project assignedEmployees array
      project.assignedEmployees.push(employeeId);
      await project.save();

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

  //update allocation
 export const updateAllocation =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const allocation =
        await Allocation.findById(
          req.params.id
        );

      if (!allocation) {
        res.status(404).json({
          message:
            "Allocation not found",
        });

        return;
      }

      const {
        allocationPercentage,
      } = req.body;

      const employeeId =
        allocation.employee;

      const otherAllocations =
        await Allocation.find({
          employee: employeeId,
          status: "Active",
          _id: {
            $ne: allocation._id,
          },
        });

      const currentTotal =
        otherAllocations.reduce(
          (total, allocation) =>
            total +
            allocation.allocationPercentage,
          0
        );

      if (
        currentTotal +
          allocationPercentage >
        100
      ) {
        res.status(400).json({
          message:
            "Total allocation cannot exceed 100%",
        });

        return;
      }

      allocation.allocationPercentage =
        allocationPercentage;

      await allocation.save();

      res.status(200).json(
        allocation
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

  //cancel Allocation
  export const cancelAllocation =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const allocation =
        await Allocation.findById(
          req.params.id
        );

      if (!allocation) {
        res.status(404).json({
          message:
            "Allocation not found",
        });

        return;
      }

      allocation.status =
        "Cancelled";

      await allocation.save();

      // Synchronize Project assignedEmployees array
      const project = await Project.findById(allocation.project);
      if (project) {
        project.assignedEmployees = project.assignedEmployees.filter(
          (id) => id.toString() !== allocation.employee.toString()
        );
        await project.save();
      }

      res.status(200).json({
        message:
          "Allocation cancelled successfully",
        allocation,
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

  //get allocation history
  export const getAllocationHistory =
  async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {

    const allocations =
 await Allocation.find({
   employee: req.params.employeeId,
 })
 .populate(
   "project"
 )
          .sort({
            createdAt: -1,
          });

      res.status(200).json(
        allocations
      );

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error",
      });
    }
  };

// get all allocations
export const getAllocations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;
    let query: any = {};

    if (status) {
      query.status = status as string;
    }

    const allocations = await Allocation.find(query)
      .populate("employee")
      .populate("project");

    res.status(200).json(allocations);
  } catch (error) {
    console.error("GET ALLOCATIONS ERROR:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};