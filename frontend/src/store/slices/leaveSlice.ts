import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import type { IEmployee } from "./employeeSlice";

export interface ILeave {
  _id: string;
  employee: IEmployee;
  leaveType: "Casual" | "Sick" | "Earned";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  replacementEmployee?: IEmployee;
  createdAt: string;
  updatedAt: string;
}

export interface ILeaveBalance {
  casualLeaveBalance: number;
  sickLeaveBalance: number;
  earnedLeaveBalance: number;
}

interface LeaveState {
  leaves: ILeave[];
  myLeaves: ILeave[];
  calendarLeaves: ILeave[];
  balance: ILeaveBalance | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaveState = {
  leaves: [],
  myLeaves: [],
  calendarLeaves: [],
  balance: null,
  loading: false,
  error: null,
};

// Fetch all leaves (Admin/Manager)
export const fetchLeaves = createAsyncThunk(
  "leaves/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/leaves");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leaves"
      );
    }
  }
);

// Fetch logged-in employee's own leaves
export const fetchMyLeaves = createAsyncThunk(
  "leaves/fetchMyLeaves",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/leaves/my-leaves");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your leaves"
      );
    }
  }
);

// Apply for leave (Employee)
export const applyLeave = createAsyncThunk(
  "leaves/apply",
  async (
    data: {
      employeeId: string;
      leaveType: string;
      startDate: string;
      endDate: string;
      reason: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/leaves", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to apply for leave"
      );
    }
  }
);

// Approve leave (Admin/Manager)
export const approveLeave = createAsyncThunk(
  "leaves/approve",
  async (
    { id, replacementEmployeeId }: { id: string; replacementEmployeeId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/leaves/${id}/approve`, {
        replacementEmployeeId,
      });
      return response.data.leave; // returns { message, leave }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to approve leave request"
      );
    }
  }
);

// Reject leave (Admin/Manager)
export const rejectLeave = createAsyncThunk(
  "leaves/reject",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/leaves/${id}/reject`);
      return response.data.leave; // returns { message, leave }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to reject leave request"
      );
    }
  }
);

// Fetch approved leaves calendar
export const fetchLeaveCalendar = createAsyncThunk(
  "leaves/fetchCalendar",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/leaves/calendar");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave calendar"
      );
    }
  }
);

// Fetch leave balances for an employee
export const fetchLeaveBalance = createAsyncThunk(
  "leaves/fetchBalance",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leaves/balance/${employeeId}`);
      return response.data.leaveBalance; // returns { employee, leaveBalance: { ... } }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave balance"
      );
    }
  }
);

const leaveSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    clearLeaveError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Leaves
      .addCase(fetchLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.leaves = action.payload;
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch My Leaves
      .addCase(fetchMyLeaves.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLeaves.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves = action.payload;
      })
      .addCase(fetchMyLeaves.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Apply Leave
      .addCase(applyLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyLeave.fulfilled, (state, action) => {
        state.loading = false;
        state.myLeaves.unshift(action.payload);
      })
      .addCase(applyLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Approve Leave
      .addCase(approveLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveLeave.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex(
          (lv) => lv._id === action.payload._id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
      })
      .addCase(approveLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reject Leave
      .addCase(rejectLeave.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectLeave.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaves.findIndex(
          (lv) => lv._id === action.payload._id
        );
        if (index !== -1) {
          state.leaves[index] = action.payload;
        }
      })
      .addCase(rejectLeave.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Leave Calendar
      .addCase(fetchLeaveCalendar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveCalendar.fulfilled, (state, action) => {
        state.loading = false;
        state.calendarLeaves = action.payload;
      })
      .addCase(fetchLeaveCalendar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Leave Balance
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLeaveError } = leaveSlice.actions;
export default leaveSlice.reducer;
