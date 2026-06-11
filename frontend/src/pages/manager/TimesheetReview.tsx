import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Users, FolderKanban, Percent, FileText, Briefcase, Calendar, FileClock, ListTodo, Check, X, AlertTriangle, FileCheck, CheckCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchPendingTimesheets, approveTimesheet, rejectTimesheet, clearTimesheetError } from "../../store/slices/timesheetSlice";

const TimesheetReview: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pendingTimesheets, loading, error } = useAppSelector((state) => state.timesheets);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPendingTimesheets());
    dispatch(clearTimesheetError());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const isAdmin = user?.role.name.toLowerCase() === "admin";

  const handleApprove = async (timesheetId: string) => {
    setSuccessMsg(null);
    setLocalError(null);
    try {
      await dispatch(approveTimesheet(timesheetId)).unwrap();
      setSuccessMsg("Timesheet approved successfully.");
      dispatch(fetchPendingTimesheets());
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to approve timesheet.");
    }
  };

  const handleReject = async (timesheetId: string) => {
    setSuccessMsg(null);
    setLocalError(null);
    try {
      await dispatch(rejectTimesheet(timesheetId)).unwrap();
      setSuccessMsg("Timesheet rejected successfully.");
      dispatch(fetchPendingTimesheets());
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to reject timesheet.");
    }
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
                <Link to="/manager/timesheets" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
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
                <Link to="/manager/timesheets" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium transition-colors">
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Timesheet Approvals</h1>
            <p className="text-xs text-slate-400 mt-1">
              Review weekly operational hours logged by employees and update approval statuses.
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-indigo-500"}`}></span>
            <span>{isAdmin ? "Admin Console Mode" : "Manager Console Mode"}</span>
          </div>
        </header>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {(localError || error) && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Pending Timesheets List */}
        <section className="glass-panel p-6 rounded-3xl relative overflow-hidden min-h-[400px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
          
          <div className="overflow-x-auto">
            {pendingTimesheets.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-slate-500 py-16">
                <FileCheck className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
                <p className="text-sm italic">All submitted timesheets have been reviewed.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 font-semibold">
                    <th className="pb-3 pr-4">Employee</th>
                    <th className="pb-3 px-4">Date Worked</th>
                    <th className="pb-3 px-4">Project Breakouts</th>
                    <th className="pb-3 px-4">Total Hours</th>
                    <th className="pb-3 px-4">Comments</th>
                    <th className="pb-3 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {pendingTimesheets.map((ts) => (
                    <tr key={ts._id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-slate-200">{ts.employee?.name}</div>
                        <div className="text-[10px] text-slate-500">{ts.employee?.email}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-250">
                        {formatDate(ts.date)}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        <div className="space-y-1">
                          {ts.projects.map((proj, pIdx) => (
                            <div key={pIdx}>
                              <strong className="text-violet-400">{proj.project?.name || "Project"}</strong>: {proj.hours} hrs
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-extrabold text-slate-200">
                        {ts.totalHours} hrs
                      </td>
                      <td className="py-4 px-4 max-w-[150px] truncate text-slate-500 italic" title={ts.comments}>
                        {ts.comments || "No comments"}
                      </td>
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(ts._id)}
                            disabled={loading}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                            title="Approve timesheet"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(ts._id)}
                            disabled={loading}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                            title="Reject timesheet"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default TimesheetReview;
