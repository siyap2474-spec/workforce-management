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
          "CREATE_EMPLOYEE",
          "UPDATE_EMPLOYEE",
          "DELETE_EMPLOYEE",
          "CREATE_PROJECT",
          "UPDATE_PROJECT",
          "DELETE_PROJECT",
          "MANAGE_ROLES",
          "VIEW_REPORTS"
        ],
      },


      {
        name: "Manager",
        description: "Project Manager",
        permissions: [
          "CREATE_ALLOCATION",
          "UPDATE_ALLOCATION",
          "APPROVE_LEAVE",
          "REVIEW_TIMESHEET",
          "VIEW_REPORTS",
          "VIEW_ASSIGNED_RESOURCES"
        ],
      },


      {
        name: "Employee",
        description: "Employee User",
        permissions: [
          "VIEW_EMPLOYEE",
          "APPLY_LEAVE",
          "SUBMIT_TIMESHEET",
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
          returnDocument: "after",
          upsert: true
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