import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export interface IProject {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Closed";
  isCriticalProject: boolean;
  assignedEmployees: string[]; // references Employee IDs
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: IProject[];
  activeProject: IProject | null;
  assignedResources: any[]; // Employees populated from /api/projects/:id/resources
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  activeProject: null,
  assignedResources: [],
  loading: false,
  error: null,
};

// Async thunks for projects API
export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (
    filters: { search?: string; status?: string } | undefined,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get("/projects", {
        params: filters || {},
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch projects"
      );
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "projects/fetchById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch project details"
      );
    }
  }
);

export const createProject = createAsyncThunk(
  "projects/create",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/projects", data);
      return response.data; // backend returns created project directly
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create project"
      );
    }
  }
);

export const updateProject = createAsyncThunk(
  "projects/update",
  async (
    { id, data }: { id: string; data: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update project"
      );
    }
  }
);

export const closeProject = createAsyncThunk(
  "projects/close",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/${id}/close`);
      return response.data.project; // backend returns { message, project }
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to close project"
      );
    }
  }
);

export const fetchAssignedResources = createAsyncThunk(
  "projects/fetchResources",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}/resources`);
      return response.data; // returns array of assigned Employees
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch assigned resources"
      );
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearActiveProject: (state) => {
      state.activeProject = null;
      state.assignedResources = [];
    },
    clearProjectError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Project By ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.activeProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.activeProject?._id === action.payload._id) {
          state.activeProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Close Project
      .addCase(closeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(
          (p) => p._id === action.payload._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.activeProject?._id === action.payload._id) {
          state.activeProject = action.payload;
        }
      })
      .addCase(closeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Assigned Resources
      .addCase(fetchAssignedResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignedResources.fulfilled, (state, action) => {
        state.loading = false;
        state.assignedResources = action.payload;
      })
      .addCase(fetchAssignedResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearActiveProject, clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
