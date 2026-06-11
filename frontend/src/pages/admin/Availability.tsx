import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Users, FolderKanban, Percent, FileText, Briefcase, Calendar, FileClock, ListTodo, UserPlus, AlertTriangle, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchResourceAvailability, clearAvailabilityError } from "../../store/slices/availabilitySlice";
import { fetchAllocations } from "../../store/slices/allocationSlice";
import { fetchEmployees } from "../../store/slices/employeeSlice";

const Availability: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { availableResources, partiallyAllocatedResources, fullyAllocatedResources, employeesOnLeave, loading, error } = useAppSelector((state) => state.availability);
  const { allocations } = useAppSelector((state) => state.allocations);
  const { employees } = useAppSelector((state) => state.employees);

  const [activeTab, setActiveTab] = useState<"available" | "partial" | "full" | "leave">("available");

  useEffect(() => {
    dispatch(fetchResourceAvailability());
    dispatch(fetchAllocations(undefined));
    dispatch(fetchEmployees(undefined));
    dispatch(clearAvailabilityError());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const isAdmin = user?.role.name.toLowerCase() === "admin";

  // Lookup helper for employee department or leave status
  const getEmployeeDetails = (employeeId: string) => {
    return employees.find((emp) => emp._id === employeeId);
  };

  // Find active allocations for an employee
  const getActiveAllocationsForEmployee = (employeeId: string) => {
    return allocations.filter(
      (al) => al.employee?._id === employeeId && al.status === "Active"
    );
  };

  // Forecast: allocations ending in the next 90 days
  const getForecastedRollOffs = () => {
    const today = new Date();
    const ninetyDaysLater = new Date();
    ninetyDaysLater.setDate(today.getDate() + 90);

    return allocations
      .filter((al) => {
        if (al.status !== "Active" || !al.endDate) return false;
        const end = new Date(al.endDate);
        return end >= today && end <= ninetyDaysLater;
      })
      .map((al) => {
        const end = new Date(al.endDate!);
        const diffTime = Math.abs(end.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...al,
          daysRemaining: diffDays,
        };
      })
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const forecastedRollOffs = getForecastedRollOffs();

  if (loading && availableResources.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Adaptive based on user role */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between p-6 z-10">
        <div>
          {isAdmin ? (
            <>
              {/* Admin header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-violet-600 text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    WFM Admin
                  </h2>
                  <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">
                    System Console
                  </span>
                </div>
              </div>

              {/* Admin nav */}
              <nav className="space-y-1.5">
                <Link to="/admin/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Shield className="w-4 h-4" />
                  <span>Admin Console</span>
                </Link>
                <Link to="/admin/employees" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Users className="w-4 h-4" />
                  <span>Employees</span>
                </Link>
                <Link to="/admin/projects" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <FolderKanban className="w-4 h-4" />
                  <span>Projects</span>
                </Link>
                <Link to="/admin/allocations" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Percent className="w-4 h-4" />
                  <span>Allocations</span>
                </Link>
                <Link to="/admin/leaves" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <FileClock className="w-4 h-4" />
                  <span>Leaves</span>
                </Link>
                <Link to="/manager/timesheets" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <ListTodo className="w-4 h-4" />
                  <span>Timesheets</span>
                </Link>
                <Link to="/admin/availability" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Availability</span>
                </Link>
                <Link to="/admin/reports" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
              </nav>
            </>
          ) : (
            <>
              {/* Manager header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 rounded-xl bg-fuchsia-600 text-white">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    WFM Manager
                  </h2>
                  <span className="text-[10px] text-fuchsia-400 font-semibold tracking-widest uppercase">
                    Project Console
                  </span>
                </div>
              </div>

              {/* Manager nav */}
              <nav className="space-y-1.5">
                <Link to="/manager/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Briefcase className="w-4 h-4" />
                  <span>Manager Dashboard</span>
                </Link>
                <Link to="/admin/allocations" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Calendar className="w-4 h-4" />
                  <span>Allocations</span>
                </Link>
                <Link to="/admin/leaves" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <FileClock className="w-4 h-4" />
                  <span>Approve Leaves</span>
                </Link>
                <Link to="/manager/timesheets" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <ListTodo className="w-4 h-4" />
                  <span>Timesheets</span>
                </Link>
                <Link to="/admin/availability" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium transition-colors">
                  <Users className="w-4 h-4" />
                  <span>Availability</span>
                </Link>
                <Link to="/admin/reports" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </Link>
              </nav>
            </>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-8 overflow-y-auto z-10 max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Resource Availability & Forecasting</h1>
            <p className="text-xs text-slate-400 mt-1">
              Analyze organizational capacity and forecast project transitions.
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-indigo-500"}`}></span>
            <span>{isAdmin ? "Admin Console Mode" : "Manager Console Mode"}</span>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Capacity Summary Group Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => setActiveTab("available")}
            className={`glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer transition-all ${
              activeTab === "available" ? "border-violet-500/80 bg-violet-650/5" : "hover:border-slate-700"
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Unallocated (0%)</span>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{availableResources.length}</h3>
          </div>

          <div
            onClick={() => setActiveTab("partial")}
            className={`glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer transition-all ${
              activeTab === "partial" ? "border-cyan-500/80 bg-cyan-650/5" : "hover:border-slate-700"
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Partially Allocated</span>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{partiallyAllocatedResources.length}</h3>
          </div>

          <div
            onClick={() => setActiveTab("full")}
            className={`glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer transition-all ${
              activeTab === "full" ? "border-emerald-500/80 bg-emerald-650/5" : "hover:border-slate-700"
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fully Booked (100%)</span>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{fullyAllocatedResources.length}</h3>
          </div>

          <div
            onClick={() => setActiveTab("leave")}
            className={`glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] cursor-pointer transition-all ${
              activeTab === "leave" ? "border-rose-500/80 bg-rose-650/5" : "hover:border-slate-700"
            }`}
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"></div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absence (On Leave)</span>
            <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{employeesOnLeave.length}</h3>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Utilization Group Display */}
          <section className="lg:col-span-2">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden min-h-[450px]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">
                {activeTab === "available" && "Available Resources (0% Booked)"}
                {activeTab === "partial" && "Partially Allocated Resources (1% - 99%)"}
                {activeTab === "full" && "Fully Allocated Resources (100% Booked)"}
                {activeTab === "leave" && "Employees Currently On Leave"}
              </h2>

              {activeTab === "available" && (
                <div className="space-y-4">
                  {availableResources.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-10 text-center">No completely unallocated employees.</p>
                  ) : (
                    availableResources.map((res) => {
                      const details = getEmployeeDetails(res.employeeId);
                      return (
                        <div key={res.employeeId} className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
                          <div>
                            <h4 className="font-semibold text-slate-200 text-sm">{res.name}</h4>
                            <span className="text-[10px] text-slate-500">{details?.department || "Department Unassigned"}</span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              100% Free
                            </span>
                            <Link
                              to="/admin/allocations"
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-violet-400 hover:text-violet-300 rounded-xl transition-all border border-slate-700"
                              title="Allocate Employee"
                            >
                              <UserPlus className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "partial" && (
                <div className="space-y-4">
                  {partiallyAllocatedResources.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-10 text-center">No partially allocated employees.</p>
                  ) : (
                    partiallyAllocatedResources.map((res) => {
                      const details = getEmployeeDetails(res.employeeId);
                      const activeAl = getActiveAllocationsForEmployee(res.employeeId);
                      return (
                        <div key={res.employeeId} className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-slate-200 text-sm">{res.name}</h4>
                              <span className="text-[10px] text-slate-500">{details?.department || "Department Unassigned"}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[10px] font-bold">
                              {res.utilization}% Booked
                            </span>
                          </div>

                          {/* Allocation Progress bar */}
                          <div className="w-full bg-slate-950 border border-slate-900 h-2 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${res.utilization}%` }}></div>
                          </div>

                          {/* Active Projects List */}
                          <div className="text-[10px] text-slate-500 space-y-1">
                            <strong className="text-slate-400 block mb-1">Active Projects:</strong>
                            {activeAl.map((al) => (
                              <div key={al._id} className="flex justify-between">
                                <span>• {al.project?.name}</span>
                                <span className="text-slate-400">{al.allocationPercentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "full" && (
                <div className="space-y-4">
                  {fullyAllocatedResources.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-10 text-center">No fully booked employees.</p>
                  ) : (
                    fullyAllocatedResources.map((res) => {
                      const details = getEmployeeDetails(res.employeeId);
                      const activeAl = getActiveAllocationsForEmployee(res.employeeId);
                      return (
                        <div key={res.employeeId} className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-slate-200 text-sm">{res.name}</h4>
                              <span className="text-[10px] text-slate-500">{details?.department || "Department Unassigned"}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              Fully Booked
                            </span>
                          </div>

                          {/* Active Projects List */}
                          <div className="text-[10px] text-slate-500 space-y-1">
                            <strong className="text-slate-400 block mb-1">Active Projects:</strong>
                            {activeAl.map((al) => (
                              <div key={al._id} className="flex justify-between">
                                <span>• {al.project?.name}</span>
                                <span className="text-slate-400 font-medium">{al.allocationPercentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === "leave" && (
                <div className="space-y-4">
                  {employeesOnLeave.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-10 text-center">No employees are currently on leave.</p>
                  ) : (
                    employeesOnLeave.map((res, idx) => {
                      const details = employees.find((emp) => emp.email === res.email);
                      return (
                        <div key={idx} className="flex justify-between items-center bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
                          <div>
                            <h4 className="font-semibold text-slate-200 text-sm">{res.name}</h4>
                            <span className="text-[10px] text-slate-500">{res.email}</span>
                          </div>
                          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                            On Leave {details?.leaveEndDate ? `until ${formatDate(details.leaveEndDate)}` : ""}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Forecasting / Upcoming Roll-offs */}
          <section className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden h-full flex flex-col min-h-[450px]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
              
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <span>90-Day Roll-off Forecast</span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {forecastedRollOffs.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-10 text-center">No roll-offs scheduled in next 90 days.</p>
                ) : (
                  forecastedRollOffs.map((al) => (
                    <div key={al._id} className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex flex-col justify-between min-h-[110px]">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-200 text-xs truncate max-w-[120px]">{al.employee?.name}</h4>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">{al.project?.name}</span>
                          </div>
                          <span className="px-2 py-0.5 bg-fuchsia-600/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-full text-[9px] font-bold">
                            {al.allocationPercentage}% Released
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-950 flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                        <span>Ends {formatDate(al.endDate!)}</span>
                        <span className="text-violet-400">{al.daysRemaining} days left</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Availability;
