import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAllocations, createAllocation, updateAllocation, cancelAllocation, fetchAllocationHistory, clearAllocationError } from "../../store/slices/allocationSlice";
import type { IAllocation } from "../../store/slices/allocationSlice";
import { fetchEmployees } from "../../store/slices/employeeSlice";
import { fetchProjects } from "../../store/slices/projectSlice";
import { Calendar, Search, Plus, Edit2, Ban, X, History, Percent, CheckCircle, ShieldAlert } from "lucide-react";

const ResourceAllocation: React.FC = () => {
  const dispatch = useAppDispatch();

  // Select states from slice
  const { allocations, history, loading, error } = useAppSelector((state) => state.allocations);
  const { employees } = useAppSelector((state) => state.employees);
  const { projects } = useAppSelector((state) => state.projects);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Active" | "Completed" | "Cancelled">("");

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<IAllocation | null>(null);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("");

  // Form states (Add)
  const [addEmployeeId, setAddEmployeeId] = useState("");
  const [addProjectId, setAddProjectId] = useState("");
  const [addAllocationPct, setAddAllocationPct] = useState(50);
  const [addStartDate, setAddStartDate] = useState("");
  const [addEndDate, setAddEndDate] = useState("");

  // Form states (Edit)
  const [editAllocationPct, setEditAllocationPct] = useState(50);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    dispatch(fetchAllocations(undefined));
    dispatch(fetchEmployees(undefined));
    dispatch(fetchProjects(undefined));
  }, [dispatch]);

  // Set default dropdown selections when modals open
  useEffect(() => {
    if (isAddModalOpen) {
      const activeEmployees = employees.filter(e => !e.isOnLeave);
      const activeProjects = projects.filter(p => p.status === "Active");
      if (activeEmployees.length > 0) setAddEmployeeId(activeEmployees[0]._id);
      if (activeProjects.length > 0) setAddProjectId(activeProjects[0]._id);
    }
  }, [isAddModalOpen, employees, projects]);

  const handleSearch = (al: IAllocation) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      al.employee?.name?.toLowerCase().includes(term) ||
      al.employee?.email?.toLowerCase().includes(term) ||
      al.project?.name?.toLowerCase().includes(term) ||
      al.employee?.department?.toLowerCase().includes(term)
    );
  };

  // Date formatter
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Submit Add Allocation
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAllocationError());
    setSuccessMsg(null);

    if (!addEmployeeId || !addProjectId || !addAllocationPct || !addStartDate || !addEndDate) {
      return;
    }

    if (new Date(addEndDate) <= new Date(addStartDate)) {
      alert("End Date must be after Start Date!");
      return;
    }

    try {
      await dispatch(
        createAllocation({
          employeeId: addEmployeeId,
          projectId: addProjectId,
          allocationPercentage: Number(addAllocationPct),
          startDate: addStartDate,
          endDate: addEndDate,
        })
      ).unwrap();

      setSuccessMsg("Employee allocated successfully!");
      setIsAddModalOpen(false);
      // Refresh list
      dispatch(fetchAllocations(undefined));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      // Handled by Redux
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (al: IAllocation) => {
    setSelectedAllocation(al);
    setEditAllocationPct(al.allocationPercentage);
    setIsEditModalOpen(true);
  };

  // Submit Edit Allocation
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearAllocationError());

    if (!selectedAllocation || !editAllocationPct) {
      return;
    }

    try {
      await dispatch(
        updateAllocation({
          id: selectedAllocation._id,
          allocationPercentage: Number(editAllocationPct),
        })
      ).unwrap();

      setIsEditModalOpen(false);
      setSelectedAllocation(null);
      dispatch(fetchAllocations(undefined));
    } catch (err) {
      // Handled by Redux
    }
  };

  // Cancel Allocation
  const handleCancelAllocation = async (id: string) => {
    if (confirm("Are you sure you want to cancel this allocation? The resource will be de-allocated from this project.")) {
      dispatch(clearAllocationError());
      try {
        await dispatch(cancelAllocation(id)).unwrap();
        dispatch(fetchAllocations(undefined));
      } catch (err) {
        // Handled by Redux
      }
    }
  };

  // Open History view
  const handleOpenHistory = (employeeId: string, name: string) => {
    setSelectedEmployeeName(name);
    dispatch(fetchAllocationHistory(employeeId));
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Decorative gradient background blob */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-fuchsia-600/5 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 flex items-center gap-3">
              <Percent className="w-8 h-8 text-fuchsia-500" />
              <span>Resource Allocations</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Allocate employees to active projects, adjust workloads, and inspect history.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Allocation</span>
          </button>
        </header>

        {/* Banners */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-3 glass-panel p-4 rounded-2xl flex items-center">
            <Search className="w-5 h-5 text-slate-500 mr-3 ml-1" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search allocations by employee name, project name, or department..."
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
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              dispatch(fetchAllocations(e.target.value || undefined));
            }}
            className="glass-panel rounded-2xl px-4 py-3 text-slate-300 focus:outline-none text-sm"
          >
            <option value="" className="bg-slate-950">All Allocation Statuses</option>
            <option value="Active" className="bg-slate-950">Active Only</option>
            <option value="Completed" className="bg-slate-950">Completed Only</option>
            <option value="Cancelled" className="bg-slate-950">Cancelled Only</option>
          </select>
        </div>

        {/* Allocations Table */}
        {loading && allocations.length === 0 ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : allocations.filter(handleSearch).length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center">
            <Percent className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No Allocations Registered</h3>
            <p className="text-slate-500 text-sm mt-1">Create a new allocation to deploy resource capacity.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-900 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-slate-900/30 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="p-4 pl-6">Employee</th>
                    <th className="p-4">Project</th>
                    <th className="p-4 text-center">Workload Pct</th>
                    <th className="p-4">Start - End Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50 text-sm">
                  {allocations.filter(handleSearch).map((al) => (
                    <tr key={al._id} className="hover:bg-slate-900/20 transition-colors">
                      {/* Employee Cell */}
                      <td className="p-4 pl-6">
                        <div>
                          <span className="block font-bold text-slate-200">{al.employee?.name || "N/A"}</span>
                          <span className="block text-[10px] text-slate-500">{al.employee?.email}</span>
                          <span className="inline-block text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 mt-1">{al.employee?.department}</span>
                        </div>
                      </td>

                      {/* Project Cell */}
                      <td className="p-4">
                        <div>
                          <span className="block font-bold text-slate-200">{al.project?.name || "N/A"}</span>
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase mt-1 ${al.project?.status === "Closed" ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {al.project?.status}
                          </span>
                        </div>
                      </td>

                      {/* Workload Percentage */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center justify-center font-bold px-3 py-1 rounded-xl text-xs ${al.status !== "Active"
                            ? "bg-slate-900 text-slate-500"
                            : al.allocationPercentage === 100
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : al.allocationPercentage >= 50
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                          {al.allocationPercentage}%
                        </span>
                      </td>

                      {/* Timeline */}
                      <td className="p-4 text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-violet-400" />
                          <span>{formatDate(al.startDate)}</span>
                          <span className="text-slate-700">-</span>
                          <span>{formatDate(al.endDate)}</span>
                        </div>
                      </td>

                      {/* Allocation Status */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${al.status === "Cancelled"
                            ? "text-rose-400"
                            : al.status === "Completed"
                              ? "text-slate-500"
                              : "text-emerald-400"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${al.status === "Cancelled" ? "bg-rose-400" : al.status === "Completed" ? "bg-slate-500" : "bg-emerald-400"}`}></span>
                          {al.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenHistory(al.employee?._id, al.employee?.name)}
                            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"
                            title="View Employee History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {al.status === "Active" && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(al)}
                                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-fuchsia-400 transition-colors"
                                title="Edit Pct"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCancelAllocation(al._id)}
                                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                                title="Cancel Allocation"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: ALLOCATE EMPLOYEE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
              <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-500" />
                <span>Create Allocation</span>
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                {/* Select Employee */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Select Employee</label>
                  <select
                    value={addEmployeeId}
                    onChange={(e) => setAddEmployeeId(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                    required
                  >
                    {employees.filter(e => !e.isOnLeave).map((e) => (
                      <option key={e._id} value={e._id} className="bg-slate-950">
                        {e.name} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Project */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Select Project</label>
                  <select
                    value={addProjectId}
                    onChange={(e) => setAddProjectId(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                    required
                  >
                    {projects.filter(p => p.status === "Active").map((p) => (
                      <option key={p._id} value={p._id} className="bg-slate-950">
                        {p.name} {p.isCriticalProject ? "[Critical]" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Allocation percentage */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Allocation Percentage (1 - 100%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={addAllocationPct}
                      onChange={(e) => setAddAllocationPct(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Date ranges */}
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Create Allocation</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT ALLOCATION % */}
        {isEditModalOpen && selectedAllocation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-sm rounded-3xl p-8 shadow-2xl relative">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-violet-500" />
                <span>Edit Workload Percentage</span>
              </h3>

              <p className="text-xs text-slate-400 mb-4">
                Update allocation load for <strong className="text-slate-200">{selectedAllocation.employee?.name}</strong> on <strong className="text-slate-200">{selectedAllocation.project?.name}</strong>.
              </p>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Allocation Percentage (1 - 100%)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editAllocationPct}
                    onChange={(e) => setEditAllocationPct(Number(e.target.value))}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                    required
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
                    <span>Save Allocation Pct</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: VIEW HISTORY */}
        {isHistoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsHistoryModalOpen(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-2 flex items-center gap-2.5">
                <History className="w-5 h-5 text-violet-500" />
                <span>Allocation History</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                All records of allocations for employee: <strong className="text-slate-300">{selectedEmployeeName}</strong>
              </p>

              {loading ? (
                <div className="py-10 flex justify-center">
                  <div className="w-8 h-8 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="py-8 text-center bg-slate-900/30 border border-slate-900 rounded-2xl">
                  <p className="text-xs text-slate-500 italic">No allocation history found for this employee.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((hist) => (
                    <div key={hist._id} className="p-4 bg-slate-900/40 border border-slate-850 rounded-2xl text-sm relative">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-slate-200">{hist.project?.name || "Deleted Project"}</h4>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${hist.status === "Cancelled"
                            ? "bg-rose-500/10 text-rose-400"
                            : hist.status === "Completed"
                              ? "bg-slate-900 text-slate-500"
                              : "bg-emerald-500/10 text-emerald-400"
                          }`}>
                          {hist.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2.5 pt-2.5 border-t border-slate-900">
                        <div>Workload: <span className="font-bold text-slate-200">{hist.allocationPercentage}%</span></div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-violet-400" />
                          <span>{formatDate(hist.startDate)} - {formatDate(hist.endDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-medium text-sm transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceAllocation;
