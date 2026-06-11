import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import type { IEmployee } from "./employeeSlice";
import type { IProject } from "./projectSlice";

export interface ITimesheetProject {
  project: IProject;
  hours: number;
}

export interface ITimesheet {
  _id: string;
  employee: IEmployee;
  date: string;
  projects: ITimesheetProject[];
  totalHours: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IWeeklySummary {
  period: {
    startDate: string;
    endDate: string;
  };
  totalHours: number;
  timesheets: ITimesheet[];
}

export interface IMonthlySummary {
  month: string;
  year: string;
  totalHours: number;
  timesheets: ITimesheet[];
}

interface TimesheetState {
  timesheets: ITimesheet[];
  pendingTimesheets: ITimesheet[];
  weeklySummary: IWeeklySummary | null;
  monthlySummary: IMonthlySummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: TimesheetState = {
  timesheets: [],
  pendingTimesheets: [],
  weeklySummary: null,
  monthlySummary: null,
  loading: false,
  error: null,
};

// Log Daily Timesheet (Employee)
export const createTimesheet = createAsyncThunk(
  "timesheets/create",
  async (
    data: {
      employeeId: string;
      date: string;
      projects: { project: string; hours: number }[];
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/timesheets", data);
      return response.data; // returns created timesheet
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to log daily hours"
      );
    }
  }
);

// Fetch Employee's own timesheets
export const fetchMyTimesheets = createAsyncThunk(
  "timesheets/fetchMy",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/timesheets/employee/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch timesheets"
      );
    }
  }
);

// Submit Timesheet (Employee)
export const submitTimesheet = createAsyncThunk(
  "timesheets/submit",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/timesheets/${id}/submit`);
      return response.data.timesheet; // returns { message, timesheet }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to submit timesheet"
      );
    }
  }
);

// Approve Timesheet (Manager)
export const approveTimesheet = createAsyncThunk(
  "timesheets/approve",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/timesheets/${id}/approve`);
      return response.data.timesheet;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve timesheet"
      );
    }
  }
);

// Reject Timesheet (Manager)
export const rejectTimesheet = createAsyncThunk(
  "timesheets/reject",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/timesheets/${id}/reject`);
      return response.data.timesheet;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject timesheet"
      );
    }
  }
);

// Fetch Pending Timesheets for Manager
export const fetchPendingTimesheets = createAsyncThunk(
  "timesheets/fetchPending",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/timesheets/pending");
      return response.data.timesheets; // returns { count, timesheets }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending timesheets"
      );
    }
  }
);

// Fetch Weekly Timesheets report for employee
export const fetchWeeklyTimesheets = createAsyncThunk(
  "timesheets/fetchWeekly",
  async (
    { employeeId, startDate, endDate }: { employeeId: string; startDate: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(`/timesheets/weekly/${employeeId}`, {
        params: { startDate, endDate },
      });
      return response.data; // returns { period: { startDate, endDate }, totalHours, timesheets }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch weekly summary"
      );
    }
  }
);

const timesheetSlice = createSlice({
  name: "timesheets",
  initialState,
  reducers: {
    clearTimesheetError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Timesheet
      .addCase(createTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets.unshift(action.payload);
      })
      .addCase(createTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch My Timesheets
      .addCase(fetchMyTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.timesheets = action.payload;
      })
      .addCase(fetchMyTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Submit Timesheet
      .addCase(submitTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.timesheets.findIndex(
          (ts) => ts._id === action.payload._id
        );
        if (index !== -1) {
          state.timesheets[index] = action.payload;
        }
      })
      .addCase(submitTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Pending
      .addCase(fetchPendingTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTimesheets = action.payload;
      })
      .addCase(fetchPendingTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve Timesheet
      .addCase(approveTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTimesheets = state.pendingTimesheets.filter(
          (ts) => ts._id !== action.payload._id
        );
      })
      .addCase(approveTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reject Timesheet
      .addCase(rejectTimesheet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectTimesheet.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingTimesheets = state.pendingTimesheets.filter(
          (ts) => ts._id !== action.payload._id
        );
      })
      .addCase(rejectTimesheet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Weekly Report
      .addCase(fetchWeeklyTimesheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklyTimesheets.fulfilled, (state, action) => {
        state.loading = false;
        state.weeklySummary = action.payload;
      })
      .addCase(fetchWeeklyTimesheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTimesheetError } = timesheetSlice.actions;
export default timesheetSlice.reducer;
