import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

import testRoutes from "./routes/testRoutes";

import employeeRoutes from "./routes/employeeRoutes";

import projectRoutes from "./routes/projectRoutes";

import allocationRoutes from "./routes/allocationRoutes";

import leaveRoutes from "./routes/leaveRoutes";

import timesheetRoutes from "./routes/timesheetRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Workforce Management API Running");
});

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/test", testRoutes);

app.use( "/api/projects",projectRoutes);

app.use( "/api/allocations", allocationRoutes);

app.use("/api/leaves",leaveRoutes);

app.use("/api/timesheets", timesheetRoutes);

export default app;