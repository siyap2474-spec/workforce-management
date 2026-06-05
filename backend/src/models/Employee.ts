import mongoose, { Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  department: string;
  skills: string[];
}

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmployee>(
  "Employee",
  employeeSchema
);