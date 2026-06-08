import mongoose, {
    Document,
    Types,
} from "mongoose";

export interface ILeave
    extends Document {
    employee: Types.ObjectId;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    status: string;

    replacementEmployee?: Types.ObjectId;
}

const leaveSchema =
    new mongoose.Schema(
        {
            employee: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                required: true,
            },

            leaveType: {
                type: String,
                enum: [
                    "Casual",
                    "Sick",
                    "Earned",
                ],
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

            reason: {
                type: String,
                required: true,
                trim: true,
            },

            replacementEmployee: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Employee",
            },

            status: {
                type: String,
                enum: [
                    "Pending",
                    "Approved",
                    "Rejected",
                ],
                default: "Pending",
            },
        },
        {
            timestamps: true,
        }
    );

export default mongoose.model<ILeave>(
    "Leave",
    leaveSchema
);