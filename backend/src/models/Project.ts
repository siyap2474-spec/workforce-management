import mongoose, {
  Document,
  Types,
} from "mongoose";

export interface IProject extends Document {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: string;
  assignedEmployees: Types.ObjectId[];

  isCriticalProject: boolean;

}

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Closed"],
      default: "Active",
    },

    isCriticalProject: {
      type: Boolean,
      default: false,
    },


    assignedEmployees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProject>(
  "Project",
  projectSchema
);