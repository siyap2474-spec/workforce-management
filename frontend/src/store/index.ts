import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import employeeReducer from "./slices/employeeSlice";
import projectReducer from "./slices/projectSlice";
import allocationReducer from "./slices/allocationSlice";
import leaveReducer from "./slices/leaveSlice";
import timesheetReducer from "./slices/timesheetSlice";
import availabilityReducer from "./slices/availabilitySlice";
import dashboardReducer from "./slices/dashboardSlice";
import reportReducer from "./slices/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    projects: projectReducer,
    allocations: allocationReducer,
    leaves: leaveReducer,
    timesheets: timesheetReducer,
    availability: availabilityReducer,
    dashboard: dashboardReducer,
    reports: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
