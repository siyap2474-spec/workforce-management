import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";
import type { IEmployee } from "./employeeSlice";
import type { IProject } from "./projectSlice";

export interface IAllocation {
  _id: string;
  employee: IEmployee;
  project: IProject;
  allocationPercentage: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Completed" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

interface AllocationState {
  allocations: IAllocation[];
  history: IAllocation[];
  loading: boolean;
  error: string | null;
}

const initialState: AllocationState = {
  allocations: [],
  history: [],
  loading: false,
  error: null,
};

// Async thunks for allocations API
export const fetchAllocations = createAsyncThunk(
  "allocations/fetchAll",
  async (statusFilter: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const response = await api.get("/allocations", {
        params: statusFilter ? { status: statusFilter } : {},
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch allocations"
      );
    }
  }
);

export const fetchAllocationHistory = createAsyncThunk(
  "allocations/fetchHistory",
  async (employeeId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/allocations/employee/${employeeId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch allocation history"
      );
    }
  }
);

export const createAllocation = createAsyncThunk(
  "allocations/create",
  async (
    data: {
      employeeId: string;
      projectId: string;
      allocationPercentage: number;
      startDate: string;
      endDate: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post("/allocations", data);
      return response.data; // backend returns created allocation
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to allocate employee"
      );
    }
  }
);

export const updateAllocation = createAsyncThunk(
  "allocations/update",
  async (
    { id, allocationPercentage }: { id: string; allocationPercentage: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/allocations/${id}`, {
        allocationPercentage,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update allocation percentage"
      );
    }
  }
);

export const cancelAllocation = createAsyncThunk(
  "allocations/cancel",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/allocations/${id}/cancel`);
      return response.data.allocation; // backend returns { message, allocation }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to cancel allocation"
      );
    }
  }
);

const allocationSlice = createSlice({
  name: "allocations",
  initialState,
  reducers: {
    clearAllocationError: (state) => {
      state.error = null;
    },
    clearAllocationHistory: (state) => {
      state.history = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Allocations
      .addCase(fetchAllocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocations.fulfilled, (state, action) => {
        state.loading = false;
        state.allocations = action.payload;
      })
      .addCase(fetchAllocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch History
      .addCase(fetchAllocationHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllocationHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchAllocationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Allocation
      .addCase(createAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAllocation.fulfilled, (state, action) => {
        state.loading = false;
        // Re-push populated state is difficult because backend returns simple ObjectId fields
        // Frontend will reload listings after allocations anyway, but we can append
        state.allocations.push(action.payload);
      })
      .addCase(createAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Allocation
      .addCase(updateAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAllocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allocations.findIndex(
          (al) => al._id === action.payload._id
        );
        if (index !== -1) {
          // preserve populated objects by copying them
          state.allocations[index] = {
            ...state.allocations[index],
            allocationPercentage: action.payload.allocationPercentage,
          };
        }
      })
      .addCase(updateAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Cancel Allocation
      .addCase(cancelAllocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAllocation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allocations.findIndex(
          (al) => al._id === action.payload._id
        );
        if (index !== -1) {
          state.allocations[index] = {
            ...state.allocations[index],
            status: action.payload.status,
          };
        }
      })
      .addCase(cancelAllocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAllocationError, clearAllocationHistory } =
  allocationSlice.actions;
export default allocationSlice.reducer;
