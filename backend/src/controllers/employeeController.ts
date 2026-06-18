import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

import Employee from "../models/Employee";
import User from "../models/User";
import Role from "../models/Role";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail";
import mongoose from "mongoose";

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
      roleId,
    } = req.body;

    if (!name || !email) {
      res.status(400).json({
        message: "Name and email are required fields",
      });
      return;
    }

    // Determine role
    let targetRole;
    if (roleId) {
      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        res.status(400).json({
          message: "Invalid role ID format",
        });
        return;
      }
      targetRole = await Role.findById(roleId);
      if (!targetRole) {
        res.status(400).json({
          message: "Role not found",
        });
        return;
      }
    } else {
      targetRole = await Role.findOne({ name: { $regex: /^employee$/i } });
      if (!targetRole) {
        res.status(400).json({
          message: "Employee role not configured on server",
        });
        return;
      }
    }

    const isEmployee = targetRole.name.toLowerCase() === "employee";

    if (isEmployee && (!phone || !department)) {
      res.status(400).json({
        message: "Phone and department are required for Employee role",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        message: "User with this email already exists",
      });
      return;
    }

    if (isEmployee) {
      const existingEmployee = await Employee.findOne({ email });
      if (existingEmployee) {
        res.status(400).json({
          message: "Employee with this email already exists",
        });
        return;
      }
    }

    // Generate random password and reset password token for activation invite
    const tempPassword = crypto.randomBytes(16).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    // create user account (not verified, needs to set password first)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: targetRole._id,
      department: department || "",
      skills: skills || [],
      isVerified: false,
      resetPasswordToken,
      resetPasswordExpires,
    });

    // create employee profile if role is Employee
    let employee = null;
    if (isEmployee) {
      employee = await Employee.create({
        name,
        email,
        phone,
        department,
        skills: skills || [],
        user: user._id,
        isOnLeave: false,
        casualLeaveBalance: 12,
        sickLeaveBalance: 8,
        earnedLeaveBalance: 15,
      });
    }

    // Send the "Verify & Set Password" invitation email
    const inviteUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetPasswordToken}`;
    await sendEmail(
      user.email,
      "Welcome to Workforce Management - Set Your Password",
      `
      <h2>Welcome to Workforce Management, ${name}!</h2>
      <p>An administrator has created an account for you with the role of <strong>${targetRole.name}</strong>.</p>
      <p>Please click the link below to set your password and activate your account:</p>
      <a href="${inviteUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; margin-top: 10px;">Set Password & Activate Account</a>
      <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">This link will expire in 24 hours.</p>
      `
    );

    res.status(201).json({
      message: `${targetRole.name} created successfully. An invitation email has been sent.`,
      employee,
    });

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


    const search =
      req.query.search as string;



    let query = {};



    if(search){


      query = {

        $or:[

          {
            name:{
              $regex:search,
              $options:"i",
            },
          },


          {
            email:{
              $regex:search,
              $options:"i",
            },
          },


          {
            department:{
              $regex:search,
              $options:"i",
            },
          },


          {
            skills:{
              $in:[
                new RegExp(search,"i"),
              ],
            },
          },

        ],

      };


    }





    const page = req.query.page ? parseInt(req.query.page as string, 10) : null;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : null;
    const paginationFormat = req.query.paginationFormat as string;

    if (page && limit && page > 0 && limit > 0) {
      const skip = (page - 1) * limit;
      const total = await Employee.countDocuments(query);
      const employees = await Employee.find(query).skip(skip).limit(limit);

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
          data: employees,
        });
        return;
      }
      res.status(200).json(employees);
      return;
    }

    const employees =
      await Employee.find(query);

    res.status(200).json(employees);

  } catch(error){

    console.error(error);

    res.status(500).json({
      message:
        "Server Error",
    });
  }

};








//get employee by id
export const getEmployeeById = async (
  req: Request,
  res: Response
): Promise<void> => {


  try {


    const employee =
      await Employee.findById(
        req.params.id
      );



    if(!employee){


      res.status(404).json({

        message:
          "Employee not found",

      });


      return;

    }




    res.status(200).json(employee);



  }catch(error){


    console.error(error);


    res.status(500).json({

      message:
        "Server Error",

    });


  }

};








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
          new:true,
          runValidators:true,
        }
      );


    if(!employee){

      res.status(404).json({
        message:"Employee not found",
      });

      return;
    }


    // update linked User also
    if(employee.user){

      await User.findByIdAndUpdate(
        employee.user,
        {
          name:req.body.name,
          email:req.body.email
        },
        {
          new:true
        }
      );

    }


    res.status(200).json(employee);


  }catch(error){

    console.error(error);

    res.status(500).json({
      message:"Server Error",
    });

  }

};









//delete employee
export const deleteEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {


  try {


    const employee =
      await Employee.findByIdAndDelete(
        req.params.id
      );



    if(!employee){


      res.status(404).json({

        message:
          "Employee not found",

      });


      return;

    }



    res.status(200).json({

      message:
        "Employee deleted successfully",

    });



  }catch(error){


    console.error(error);


    res.status(500).json({

      message:
        "Server Error",

    });


  }

};

// get logged-in employee profile
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const employee = await Employee.findOne({ user: req.user._id });

    if (!employee) {
      res.status(404).json({ message: "Employee profile not found" });
      return;
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// update logged-in employee profile
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const { phone, skills, name } = req.body;

    const employee = await Employee.findOneAndUpdate(
      { user: req.user._id },
      { phone, skills, name },
      { new: true, runValidators: true }
    );

    if (!employee) {
      res.status(404).json({ message: "Employee profile not found" });
      return;
    }

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};