import mongoose, { Document, Types } from "mongoose";

import { IRole } from "./Role";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Types.ObjectId | IRole;
  department?: string;
  skills?: string[];
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
}
const userSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },

    department: {
      type: String,
      default: "",
    },

    skills: {
      type: [String],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", userSchema);