import mongoose, {
    Document,
    Types,
} from "mongoose";


export interface ITimesheet
    extends Document {

    employee: Types.ObjectId;

    date: Date;

    projects: {
        project: Types.ObjectId;
        hours: number;
    }[];

    totalHours: number;

    status: string;

    comments?: string;
}


const timesheetSchema =
    new mongoose.Schema(
        {

            employee: {
                type:
                    mongoose.Schema.Types.ObjectId,
                ref: "Employee",
                required: true,
            },


            date: {
                type: Date,
                required: true,
            },


            projects: [
                {
                    project: {
                        type:
                            mongoose.Schema.Types.ObjectId,
                        ref: "Project",
                        required: true,
                    },


                    hours: {
                        type: Number,
                        required: true,
                    },
                }
            ],


            totalHours: {
                type: Number,
                required: true,
            },


            status: {
                type: String,
                enum: [
                    "Draft",
                    "Submitted",
                    "Approved",
                    "Rejected",
                ],
                default: "Draft",
            },


            comments: {
                type: String,
                trim: true,
            },

        },
        {
            timestamps: true,
        }
    );



export default mongoose.model<ITimesheet>(
    "Timesheet",
    timesheetSchema
);