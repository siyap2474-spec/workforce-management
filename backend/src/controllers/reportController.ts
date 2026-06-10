import { Request, Response } from "express";

import Employee from "../models/Employee";
import Allocation from "../models/Allocation";
import Timesheet from "../models/Timesheet";
import Project from "../models/Project";
import Leave from "../models/Leave";


// 1. Utilization Report

export const getUtilizationReport =
async (
 req: Request,
 res: Response
): Promise<void> => {

 try {

 const employees =
 await Employee.find();

 const report:any[] = [];

 for(const employee of employees){

 const allocations =
 await Allocation.find({

   employee: employee._id,

   status:"Active"

 });

 const allocationPercentage =
 allocations.reduce(
  (total,item)=>
  total + item.allocationPercentage,
  0
 );

 const timesheets =
 await Timesheet.find({

   employee: employee._id,

   status:"Approved"

 });

 const actualHours =
 timesheets.reduce(
  (total,item)=>
  total + item.totalHours,
  0
 );

 report.push({

   employeeName:
   employee.name,

   allocationPercentage,

   actualHours,

   utilizationPercentage:
   allocationPercentage

 });

 }

 res.status(200).json(
  report
 );

 }
 catch(error){

 console.error(error);

 res.status(500).json({

 message:"Server Error"

 });

 }

};




// 2. Project Report

export const getProjectReport =
async(
 req:Request,
 res:Response
):Promise<void>=>{


try{


const projects =
await Project.find()
.populate(
 "assignedEmployees",
 "name email"
);



const report:any[]=[];



for(const project of projects){


const allocations =
await Allocation.find({

 project:project._id,

 status:"Active"

})
.populate(
 "employee",
 "name email"
);



const timesheets =
await Timesheet.find({

 "projects.project":
 project._id,

 status:"Approved"

});



const totalHours =
timesheets.reduce(
(total,item)=>
total+item.totalHours,
0
);



report.push({

 project:
 project.name,


 allocatedResources:
 allocations.map(
 item=>item.employee
 ),


 totalHours,


 completionStatus:
 project.status


});


}



res.status(200).json(
report
);



}
catch(error){

console.error(error);

res.status(500).json({

message:"Server Error"

});

}

};




// 3. Leave Report

export const getLeaveReport =
async(
req:Request,
res:Response
):Promise<void>=>{


try{


const employees =
await Employee.find();



const report:any[]=[];



for(const employee of employees){


const leaveCount =
await Leave.countDocuments({

 employee:
 employee._id,

 status:
 "Approved"

});



report.push({

 department:
 employee.department,


 employeeName:
 employee.name,


 approvedLeaves:
 leaveCount


});


}



res.status(200).json(
report
);



}
catch(error){

console.error(error);

res.status(500).json({

message:"Server Error"

});

}

};