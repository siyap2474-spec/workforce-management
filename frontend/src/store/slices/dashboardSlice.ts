import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface IDepartmentCount {
  _id: string; // Department name
  count: number;
}

export interface IAdminDashboardData {
  cards: {
    totalEmployees: number;
    activeProjects: number;
    resourcesAllocated: number;
    employeesOnLeave: number;
  };
  charts: {
    departmentDistribution: IDepartmentCount[];
    resourceUtilization: Array<{
      _id: string;
      employee: {
        _id: string;
        name: string;
      };
      project: string;
      allocationPercentage: number;
      startDate: string;
      endDate: string;
      status: string;
    }>;
  };
}

export interface IManagerDashboardData {
  myProjects: Array<{
    _id: string;
    employee: {
      _id: string;
      name: string;
      email: string;
    };
    project: {
      _id: string;
      name: string;
    };
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  assignedResources: number;
  pendingTimesheets: number;
  pendingLeaves: number;
}

export interface IEmployeeDashboardData {
  currentProjects: Array<{
    _id: string;
    employee: string;
    project: {
      _id: string;
      name: string;
    };
    allocationPercentage: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
  };
  monthlyHours: number;
}

interface DashboardState {
  adminData: IAdminDashboardData | null;
  managerData: IManagerDashboardData | null;
  employeeData: IEmployeeDashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  adminData: null,
  managerData: null,
  employeeData: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchAdminDashboard = createAsyncThunk(
  "dashboard/fetchAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/admin");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch admin dashboard data"
      );
    }
  }
);

export const fetchManagerDashboard = createAsyncThunk(
  "dashboard/fetchManager",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/dashboard/manager");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch manager dashboard data"
      );
    }
  }
);

export const fetchEmployeeDashboard = createAsyncThunk(
  "dashboard/fetchEmployee",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/dashboard/employee/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee dashboard data"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.adminData = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Manager
      .addCase(fetchManagerDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.managerData = action.payload;
      })
      .addCase(fetchManagerDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Employee
      .addCase(fetchEmployeeDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeData = action.payload;
      })
      .addCase(fetchEmployeeDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
