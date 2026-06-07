import mongoose, {
  Document,
  Types,
} from "mongoose";

export interface IAllocation
  extends Document {
  employee: Types.ObjectId;
  project: Types.ObjectId;
  allocationPercentage: number;
  startDate: Date;
  endDate: Date;
  status: string;
}

const allocationSchema =
  new mongoose.Schema(
    {
      employee: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true,
      },

      project: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      },

      allocationPercentage: {
        type: Number,
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
        enum: [
          "Active",
          "Completed",
          "Cancelled",
        ],
        default: "Active",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IAllocation>(
  "Allocation",
  allocationSchema
);