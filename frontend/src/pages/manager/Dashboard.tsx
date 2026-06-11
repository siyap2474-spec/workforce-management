import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Briefcase, Calendar, FileClock, ListTodo, Users, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchManagerDashboard } from "../../store/slices/dashboardSlice";

const ManagerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { managerData, loading, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchManagerDashboard());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative">
      {/* Decorative gradient background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-fuchsia-600/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col justify-between p-6 z-10">
        <div>
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

          <nav className="space-y-1.5">
            <Link to="/manager/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium transition-colors">
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Manager Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, {user?.name} ({user?.email})
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span>Manager Mode Active</span>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && !managerData ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
          </div>
        ) : (
          managerData && (
            <div className="space-y-8 animate-fadeIn">
              {/* Info Cards */}
              <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned Resources</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{managerData.assignedResources}</h3>
                </div>

                <Link to="/manager/timesheets" className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] hover:border-slate-700 transition-all">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Timesheets</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{managerData.pendingTimesheets}</h3>
                </Link>

                <Link to="/admin/leaves" className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px] hover:border-slate-700 transition-all">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Leaves</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{managerData.pendingLeaves}</h3>
                </Link>
              </section>

              {/* Active Projects Table */}
              <section className="glass-panel p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent"></div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Allocations on Managed Projects</h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Allocation %</th>
                        <th className="py-3 px-4">Period</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {managerData.myProjects.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500 italic">No allocations on managed projects.</td>
                        </tr>
                      ) : (
                        managerData.myProjects.map((alloc) => (
                          <tr key={alloc._id} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-200">{alloc.project?.name}</td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div>{alloc.employee?.name}</div>
                              <div className="text-[10px] text-slate-500">{alloc.employee?.email}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">{alloc.allocationPercentage}%</td>
                            <td className="py-3.5 px-4 text-slate-400 font-medium">
                              {formatDate(alloc.startDate)} - {formatDate(alloc.endDate)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                                alloc.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}>
                                {alloc.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
