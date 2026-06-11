import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface IAvailabilityResource {
  employeeId: string;
  name: string;
  utilization: number;
  available: number;
}

export interface IEmployeeOnLeave {
  name: string;
  email: string;
}

interface AvailabilityState {
  availableResources: IAvailabilityResource[];
  partiallyAllocatedResources: IAvailabilityResource[];
  fullyAllocatedResources: IAvailabilityResource[];
  employeesOnLeave: IEmployeeOnLeave[];
  loading: boolean;
  error: string | null;
}

const initialState: AvailabilityState = {
  availableResources: [],
  partiallyAllocatedResources: [],
  fullyAllocatedResources: [],
  employeesOnLeave: [],
  loading: false,
  error: null,
};

// Fetch Resource Availability groups
export const fetchResourceAvailability = createAsyncThunk(
  "availability/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/availability");
      return response.data; // returns { availableResources, partiallyAllocatedResources, fullyAllocatedResources, employeesOnLeave }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch resource availability"
      );
    }
  }
);

const availabilitySlice = createSlice({
  name: "availability",
  initialState,
  reducers: {
    clearAvailabilityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResourceAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResourceAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availableResources = action.payload.availableResources;
        state.partiallyAllocatedResources = action.payload.partiallyAllocatedResources;
        state.fullyAllocatedResources = action.payload.fullyAllocatedResources;
        state.employeesOnLeave = action.payload.employeesOnLeave;
      })
      .addCase(fetchResourceAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAvailabilityError } = availabilitySlice.actions;
export default availabilitySlice.reducer;
