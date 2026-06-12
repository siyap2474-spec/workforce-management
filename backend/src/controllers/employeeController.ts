import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

import Employee from "../models/Employee";
import User from "../models/User";
import Role from "../models/Role";
import bcrypt from "bcryptjs";




//create employee
export const createEmployee = async (
  req: Request,
  res: Response
): Promise<void> => {

  try {

    const {
      name,
      email,
      password,
      phone,
      department,
      skills,
    } = req.body;



    if (
      !name ||
      !email ||
      !password ||
      !phone ||
      !department
    ) {

      res.status(400).json({
        message:
          "All required fields must be provided",
      });

      return;
    }




    const existingEmployee =
      await Employee.findOne({
        email,
      });



    const existingUser =
      await User.findOne({
        email,
      });



    if (
      existingEmployee ||
      existingUser
    ) {

      res.status(400).json({
        message:
          "Employee already exists",
      });

      return;
    }

    // find Employee role

    const employeeRole =
      await Role.findOne({
        name:"Employee",
      });

    if(!employeeRole){

      res.status(400).json({
        message:
          "Employee role not found",
      });

      return;

    }

    // hash password

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // create user account

    const user =
      await User.create({

        name,

        email,

        password:
          hashedPassword,

        role:
          employeeRole._id,

        department,

        isVerified:true,

      });

    // create employee profile

    const employee =
      await Employee.create({

        name,

        email,

        phone,

        department,

        skills,

        user:
          user._id,

      });

    res.status(201).json({

      message:
        "Employee created successfully",

      employee,

    });

  } catch(error){

    console.error(error);

    res.status(500).json({

      message:
        "Server Error",

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