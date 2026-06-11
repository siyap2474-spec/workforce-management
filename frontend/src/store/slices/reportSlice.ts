import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface IUtilizationReportItem {
  employeeName: string;
  allocationPercentage: number;
  actualHours: number;
  utilizationPercentage: number;
}

export interface IProjectReportItem {
  project: string;
  allocatedResources: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  totalHours: number;
  completionStatus: "Active" | "Closed";
}

export interface ILeaveReportItem {
  department: string;
  employeeName: string;
  approvedLeaves: number;
}

interface ReportState {
  utilizationReport: IUtilizationReportItem[];
  projectReport: IProjectReportItem[];
  leaveReport: ILeaveReportItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  utilizationReport: [],
  projectReport: [],
  leaveReport: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchUtilizationReport = createAsyncThunk(
  "reports/fetchUtilization",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/utilization");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch resource utilization report"
      );
    }
  }
);

export const fetchProjectReport = createAsyncThunk(
  "reports/fetchProject",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/projects");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project tracking report"
      );
    }
  }
);

export const fetchLeaveReport = createAsyncThunk(
  "reports/fetchLeave",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/reports/leaves");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave summary report"
      );
    }
  }
);

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Utilization Report
      .addCase(fetchUtilizationReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUtilizationReport.fulfilled, (state, action) => {
        state.loading = false;
        state.utilizationReport = action.payload;
      })
      .addCase(fetchUtilizationReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Project Report
      .addCase(fetchProjectReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectReport.fulfilled, (state, action) => {
        state.loading = false;
        state.projectReport = action.payload;
      })
      .addCase(fetchProjectReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Leave Report
      .addCase(fetchLeaveReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveReport.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveReport = action.payload;
      })
      .addCase(fetchLeaveReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReportsError } = reportSlice.actions;
export default reportSlice.reducer;
