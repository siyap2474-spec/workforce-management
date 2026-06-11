import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProjects, createProject, updateProject, closeProject, fetchAssignedResources, clearProjectError } from "../../store/slices/projectSlice";
import { FolderKanban, Search, Plus, Edit2, Ban, X, Users, Save, Calendar, AlertTriangle, ShieldAlert } from "lucide-react";
import type { IProject } from "../../store/slices/projectSlice";

const ProjectManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, assignedResources, loading, error } = useAppSelector((state) => state.projects);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Closed">("");

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResourcesModalOpen, setIsResourcesModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);

  // Form states (Add)
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addStartDate, setAddStartDate] = useState("");
  const [addEndDate, setAddEndDate] = useState("");
  const [addIsCritical, setAddIsCritical] = useState(false);

  // Form states (Edit)
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [editIsCritical, setEditIsCritical] = useState(false);

  // Date formatter helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  useEffect(() => {
    dispatch(fetchProjects({ search: searchTerm, status: statusFilter || undefined }));
  }, [dispatch, searchTerm, statusFilter]);

  // Submit Add Project
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearProjectError());

    if (!addName || !addDescription || !addStartDate || !addEndDate) {
      return;
    }

    if (new Date(addEndDate) <= new Date(addStartDate)) {
      alert("End Date must be after the Start Date!");
      return;
    }

    try {
      await dispatch(
        createProject({
          name: addName,
          description: addDescription,
          startDate: addStartDate,
          endDate: addEndDate,
          isCriticalProject: addIsCritical,
        })
      ).unwrap();

      // Reset & close
      setAddName("");
      setAddDescription("");
      setAddStartDate("");
      setAddEndDate("");
      setAddIsCritical(false);
      setIsAddModalOpen(false);
    } catch (err) {
      // Handled by Redux
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (proj: IProject) => {
    setSelectedProject(proj);
    setEditName(proj.name);
    setEditDescription(proj.description);
    // Format dates to YYYY-MM-DD for input fields
    setEditStartDate(proj.startDate.substring(0, 10));
    setEditEndDate(proj.endDate.substring(0, 10));
    setEditIsCritical(proj.isCriticalProject);
    setIsEditModalOpen(true);
  };

  // Submit Edit Project
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearProjectError());

    if (!selectedProject || !editName || !editDescription || !editStartDate || !editEndDate) {
      return;
    }

    if (new Date(editEndDate) <= new Date(editStartDate)) {
      alert("End Date must be after the Start Date!");
      return;
    }

    try {
      await dispatch(
        updateProject({
          id: selectedProject._id,
          data: {
            name: editName,
            description: editDescription,
            startDate: editStartDate,
            endDate: editEndDate,
            isCriticalProject: editIsCritical,
          },
        })
      ).unwrap();

      setIsEditModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      // Handled by Redux
    }
  };

  // Close Project
  const handleCloseProject = async (id: string) => {
    if (confirm("Are you sure you want to close this project? Closed projects cannot be modified or allocated to new resources.")) {
      dispatch(clearProjectError());
      try {
        await dispatch(closeProject(id)).unwrap();
      } catch (err) {
        // Handled by Redux
      }
    }
  };

  // View Assigned Resources
  const handleViewResources = (proj: IProject) => {
    setSelectedProject(proj);
    dispatch(fetchAssignedResources(proj._id));
    setIsResourcesModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Decorative gradient blobs */}
      <div className="absolute bottom-1/4 left-1/4 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-violet-600/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 flex items-center gap-3">
              <FolderKanban className="w-8 h-8 text-violet-500" />
              <span>Project Management</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Initialize new corporate projects, update details, close completed endeavors, and review active allocations.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search & Filter bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 glass-panel p-4 rounded-2xl flex items-center">
            <Search className="w-5 h-5 text-slate-500 mr-3 ml-1" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by name..."
              className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="p-1 text-slate-500 hover:text-slate-300">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="glass-panel rounded-2xl px-4 py-3 text-slate-300 focus:outline-none text-sm"
          >
            <option value="" className="bg-slate-950">All Project Statuses</option>
            <option value="Active" className="bg-slate-950">Active Only</option>
            <option value="Closed" className="bg-slate-950">Closed Only</option>
          </select>
        </div>

        {/* Projects Grid */}
        {loading && projects.length === 0 ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No Projects Found</h3>
            <p className="text-slate-500 text-sm mt-1">Initialize a new project or adjust filters to list records.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj._id}
                className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between glass-panel-hover"
              >
                <div>
                  {/* Top Bar - Critical & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === "Closed"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${proj.status === "Closed" ? "bg-rose-400" : "bg-emerald-400"}`}></span>
                      {proj.status}
                    </span>

                    {proj.isCriticalProject && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Critical</span>
                      </span>
                    )}
                  </div>

                  {/* Name & Desc */}
                  <h3 className="text-lg font-bold text-slate-100 mb-2 truncate">{proj.name}</h3>
                  <p className="text-slate-400 text-xs line-clamp-3 mb-4 leading-relaxed">{proj.description}</p>

                  {/* Date ranges */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 pt-3 border-t border-slate-900">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span>{formatDate(proj.startDate)}</span>
                    <span className="text-slate-700 font-semibold">•</span>
                    <span>{formatDate(proj.endDate)}</span>
                  </div>
                </div>

                {/* Bottom Bar: Actions & Allocated Count */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-900">
                  <button
                    onClick={() => handleViewResources(proj)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-violet-400" />
                    <span>Allocated: {proj.assignedEmployees?.length || 0}</span>
                  </button>

                  {proj.status === "Active" && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCloseProject(proj._id)}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Close Project"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL 1: CREATE PROJECT */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-violet-500" />
                <span>Create New Project</span>
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm min-h-[80px]"
                    placeholder="Enter description..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={addStartDate}
                      onChange={(e) => setAddStartDate(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={addEndDate}
                      onChange={(e) => setAddEndDate(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Critical toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="block text-sm font-semibold text-slate-200">Mark as Critical</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Treated with priority in leaves approval</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={addIsCritical}
                    onChange={(e) => setAddIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-900 border-slate-800 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Create Project</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT PROJECT */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-violet-500" />
                <span>Edit Project Details</span>
              </h3>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Project Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={editEndDate}
                      onChange={(e) => setEditEndDate(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Critical toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="block text-sm font-semibold text-slate-200">Mark as Critical</span>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-wider font-semibold">Treated with priority in leaves approval</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editIsCritical}
                    onChange={(e) => setEditIsCritical(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 bg-slate-900 border-slate-800 focus:ring-violet-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Project Details</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: VIEW ASSIGNED RESOURCES */}
        {isResourcesModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsResourcesModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2.5">
                <Users className="w-5 h-5 text-violet-500" />
                <span>Assigned Resources</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Employees currently allocated to <strong className="text-slate-300">{selectedProject.name}</strong>
              </p>

              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              ) : assignedResources.length === 0 ? (
                <div className="py-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl">
                  <p className="text-xs text-slate-500 italic">No resources allocated to this project yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedResources.map((res: any) => (
                    <div key={res._id} className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl text-sm">
                      <div>
                        <span className="block font-bold text-slate-200">{res.name}</span>
                        <span className="block text-[10px] text-slate-500">{res.email}</span>
                      </div>
                      <span className="px-3 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold">
                        {res.department}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsResourcesModalOpen(false)}
                className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;
