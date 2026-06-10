import dotenv from "dotenv";
import { connectDB } from "../config/db";
import Role from "../models/Role";

dotenv.config();


const seedRoles = async () => {

  try {

    await connectDB();


    const roles = [

      {
        name: "Admin",

        description: "System Administrator",

        permissions: [

          // Employee Management
          "CREATE_EMPLOYEE",
          "UPDATE_EMPLOYEE",
          "DELETE_EMPLOYEE",


          // Project Management
          "CREATE_PROJECT",
          "UPDATE_PROJECT",
          "DELETE_PROJECT",


          // Allocation Management
          "CREATE_ALLOCATION",
          "UPDATE_ALLOCATION",
          "CANCEL_ALLOCATION",
          "VIEW_ALLOCATION_HISTORY",


          // Leave Management
          "VIEW_LEAVES",
          "APPROVE_LEAVE",
          "REJECT_LEAVE",
          "VIEW_LEAVE_CALENDAR",


          // System
          "MANAGE_ROLES",
          "VIEW_REPORTS"

        ],
      },



      {
        name: "Manager",

        description: "Project Manager",

        permissions: [


          // Allocation Management
          "CREATE_ALLOCATION",
          "UPDATE_ALLOCATION",
          "CANCEL_ALLOCATION",
          "VIEW_ALLOCATION_HISTORY",


          // Leave Management
          "VIEW_LEAVES",
          "APPROVE_LEAVE",
          "REJECT_LEAVE",
          "VIEW_LEAVE_CALENDAR",


          // Timesheet
          "REVIEW_TIMESHEET",


          // Reports
          "VIEW_REPORTS",


          // Project
          "VIEW_ASSIGNED_RESOURCES"

        ],
      },



      {
        name: "Employee",

        description: "Employee User",

        permissions: [

          "VIEW_EMPLOYEE",

          // Leave
          "APPLY_LEAVE",

          // Timesheet
          "SUBMIT_TIMESHEET",

          // Profile
          "UPDATE_PROFILE"

        ],
      }

    ];




    for (const role of roles) {


      await Role.findOneAndUpdate(

        {
          name: role.name
        },


        role,


        {
          upsert: true,
          returnDocument: "after"
        }

      );

    }



    console.log(
      "Roles updated successfully"
    );



    process.exit(0);



  } catch (error) {


    console.error(error);


    process.exit(1);


  }

};



seedRoles();