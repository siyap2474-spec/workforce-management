import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Users, FolderKanban, FileText, Percent, FileClock, AlertTriangle, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchAdminDashboard } from "../../store/slices/dashboardSlice";
import { fetchUtilizationReport } from "../../store/slices/reportSlice";

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { adminData, loading: dashLoading, error: dashError } = useAppSelector((state) => state.dashboard);
  const { utilizationReport, loading: reportLoading, error: reportError } = useAppSelector((state) => state.reports);

  useEffect(() => {
    dispatch(fetchAdminDashboard());
    dispatch(fetchUtilizationReport());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const totalDeptEmployees = adminData?.charts.departmentDistribution.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const maxHours = Math.max(...utilizationReport.map((u) => u.actualHours), 10);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const loading = dashLoading || reportLoading;
  const error = dashError || reportError;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between p-6 z-10">
        <div>
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

          <nav className="space-y-1.5">
            <Link to="/admin/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
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
            <Link to="/admin/availability" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
              <Users className="w-4 h-4" />
              <span>Availability</span>
            </Link>
            <Link to="/admin/reports" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
              <FileText className="w-4 h-4" />
              <span>Reports</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 text-rose-400 text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* Main panel */}
      <main className="flex-1 p-8 overflow-y-auto z-10 max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, {user?.name} ({user?.email})
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Admin Mode Active</span>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && !adminData ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          adminData && (
            <div className="space-y-8 animate-fadeIn">
              {/* Info Cards */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Employees</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{adminData.cards.totalEmployees}</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Projects</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{adminData.cards.activeProjects}</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Allocations</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{adminData.cards.resourcesAllocated}</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employees On Leave</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{adminData.cards.employeesOnLeave}</h3>
                </div>
              </section>

              {/* Charts & Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Distribution (Horizontal bar chart) */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col min-h-[350px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Department Distribution</h2>
                  
                  <div className="space-y-5 flex-1 flex flex-col justify-center">
                    {adminData.charts.departmentDistribution.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-8">No department data found.</p>
                    ) : (
                      adminData.charts.departmentDistribution.map((dept) => {
                        const percent = Math.round((dept.count / totalDeptEmployees) * 100);
                        return (
                          <div key={dept._id || "unassigned"} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-300">{dept._id || "Unassigned"}</span>
                              <span className="text-slate-400">{dept.count} ({percent}%)</span>
                            </div>
                            <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-full rounded-full"
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Resource Utilization list */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col min-h-[350px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Active Resource Utilization</h2>
                  
                  <div className="overflow-y-auto flex-1 max-h-[300px] pr-1 space-y-3">
                    {adminData.charts.resourceUtilization.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-8">No active allocations found.</p>
                    ) : (
                      adminData.charts.resourceUtilization.map((alloc) => (
                        <div key={alloc._id} className="flex justify-between items-center bg-slate-900/40 border border-slate-900/60 p-3 rounded-2xl">
                          <div>
                            <h4 className="font-semibold text-slate-200 text-xs">{alloc.employee?.name}</h4>
                            <span className="text-[10px] text-slate-500 block">End Date: {formatDate(alloc.endDate)}</span>
                          </div>
                          <span className={`px-2 py-0.5 border rounded-full text-[9px] font-bold ${
                            alloc.allocationPercentage === 100
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                          }`}>
                            {alloc.allocationPercentage}% Allocated
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Monthly Timesheets (Vertical Bar Chart) */}
                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col min-h-[350px] lg:col-span-2">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent"></div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Monthly Timesheets (Approved Logged Hours)</h2>
                  
                  <div className="flex items-end justify-around gap-2 flex-1 min-h-[220px] border-b border-slate-900/40 pb-4 overflow-x-auto">
                    {utilizationReport.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-8">No timesheet records found.</p>
                    ) : (
                      utilizationReport.slice(0, 10).map((item, index) => {
                        const barHeight = Math.min(100, Math.round((item.actualHours / maxHours) * 100));
                        return (
                          <div key={index} className="flex flex-col items-center gap-2 group relative w-16 flex-shrink-0">
                            {/* Hover Tooltip */}
                            <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all duration-200 bg-slate-900 border border-slate-800 text-[10px] text-slate-200 px-2.5 py-1 rounded-xl z-20 whitespace-nowrap shadow-xl">
                              {item.actualHours} Hours Logged
                            </div>
                            
                            {/* Bar Column */}
                            <div className="w-7 bg-slate-950 border border-slate-900/60 h-40 rounded-t-xl flex items-end overflow-hidden">
                              <div
                                className="w-full bg-gradient-to-t from-violet-600 to-fuchsia-600 rounded-t-lg transition-all duration-500"
                                style={{ height: `${barHeight}%` }}
                              ></div>
                            </div>
                            
                            {/* Label */}
                            <span className="text-[10px] text-slate-400 truncate max-w-full font-semibold text-center" title={item.employeeName}>
                              {item.employeeName.split(" ")[0]}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
