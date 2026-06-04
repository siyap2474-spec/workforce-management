import dotenv from "dotenv";
import { connectDB } from "../config/db";
import Role from "../models/Role";

dotenv.config();

const seedRoles = async () => {
  try {
    await connectDB();

    await Role.deleteMany();

    await Role.insertMany([
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
          "VIEW_REPORTS",
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
        ],
      },

      {
        name: "Employee",
        description: "Employee User",
        permissions: [
          "APPLY_LEAVE",
          "SUBMIT_TIMESHEET",
          "UPDATE_PROFILE",
        ],
      },
    ]);

    console.log("Roles Seeded Successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

seedRoles();