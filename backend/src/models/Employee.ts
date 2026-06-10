import mongoose, { Document } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  department: string;
  skills: string[];
  isOnLeave: boolean;
  leaveEndDate?: Date;

  casualLeaveBalance: number;
  sickLeaveBalance: number;
  earnedLeaveBalance: number;

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

    isOnLeave: {
      type: Boolean,
      default: false,
    },

    leaveEndDate: {
  type: Date,
},

    casualLeaveBalance: {
      type: Number,
      default: 12,
    },

    sickLeaveBalance: {
      type: Number,
      default: 8,
    },

    earnedLeaveBalance: {
      type: Number,
      default: 15,
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