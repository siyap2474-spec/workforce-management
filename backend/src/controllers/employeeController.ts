import { Request, Response } from "express";
import Employee from "../models/Employee";

//create employee
export const createEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      department,
      skills,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !department
    ) {
      res.status(400).json({
        message: "All required fields must be provided",
      });
      return;
    }

    const existingEmployee =
      await Employee.findOne({ email });

    if (existingEmployee) {
      res.status(400).json({
        message: "Employee already exists",
      });
      return;
    }

    const employee =
      await Employee.create({
        name,
        email,
        phone,
        department,
        skills,
      });

    res.status(201).json(employee);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//get employee
export const getEmployees = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const search = req.query.search as string;

    let query = {};

    if (search) {
      query = {
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            department: {
              $regex: search,
              $options: "i",
            },
          },
          {
            skills: {
              $in: [
                new RegExp(search, "i"),
              ],
            },
          },
        ],
      };
    }

    const employees =
      await Employee.find(query);

    res.status(200).json(employees);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//get employee by id
export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await Employee.findById(
      req.params.id
    );

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.status(200).json(employee);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//update employee
export const updateEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee =
      await Employee.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.status(200).json(employee);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

//delete employee
export const deleteEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const employee = await Employee.findByIdAndDelete(
      req.params.id
    );

    if (!employee) {
      res.status(404).json({
        message: "Employee not found",
      });
      return;
    }

    res.status(200).json({
      message: "Employee deleted successfully",
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};