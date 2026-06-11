import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, FileClock, CalendarDays, Compass, Plus, Trash2, Send, CheckCircle, ShieldAlert, AlertTriangle, Play, FileJson } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchProfile } from "../../store/slices/employeeSlice";
import { fetchProjects } from "../../store/slices/projectSlice";
import { createTimesheet, fetchMyTimesheets, submitTimesheet, fetchWeeklyTimesheets, clearTimesheetError } from "../../store/slices/timesheetSlice";

interface IProjectRow {
  projectId: string;
  hours: number;
}

const Timesheets: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.employees);
  const { projects } = useAppSelector((state) => state.projects);
  const { timesheets, weeklySummary, loading, error } = useAppSelector((state) => state.timesheets);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [projectRows, setProjectRows] = useState<IProjectRow[]>([{ projectId: "", hours: 0 }]);
  // Feedback Messages
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearTimesheetError());
    dispatch(fetchProjects({ status: "Active" }));
    if (!profile) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  const loadTimesheetData = () => {
    if (profile?._id) {
      dispatch(fetchMyTimesheets(profile._id));
      
      // Calculate start and end date for current week (Monday to Sunday)
      const today = new Date();
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      const monday = new Date(today.setDate(diff));
      const sunday = new Date(today.setDate(diff + 6));
      
      const monStr = monday.toISOString().split("T")[0];
      const sunStr = sunday.toISOString().split("T")[0];

      dispatch(
        fetchWeeklyTimesheets({
          employeeId: profile._id,
          startDate: monStr,
          endDate: sunStr,
        })
      );
    }
  };

  useEffect(() => {
    loadTimesheetData();
  }, [dispatch, profile?._id]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const handleAddRow = () => {
    setProjectRows([...projectRows, { projectId: "", hours: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    setProjectRows(projectRows.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: keyof IProjectRow, value: string | number) => {
    const updated = [...projectRows];
    if (field === "projectId") {
      updated[index].projectId = value as string;
    } else {
      updated[index].hours = Math.max(0, Number(value));
    }
    setProjectRows(updated);
  };

  const validateForm = (): boolean => {
    setFormError(null);
    setSuccessMsg(null);

    if (!profile?._id) {
      setFormError("Employee profile not found. Cannot submit timesheet.");
      return false;
    }

    if (!date) {
      setFormError("Please select a date.");
      return false;
    }

    // Check row fields
    for (let i = 0; i < projectRows.length; i++) {
      if (!projectRows[i].projectId) {
        setFormError("All project rows must have a selected project.");
        return false;
      }
      if (projectRows[i].hours <= 0) {
        setFormError("Hours must be greater than zero.");
        return false;
      }
    }

    // Check duplicate projects
    const projectIds = projectRows.map((r) => r.projectId);
    const duplicates = projectIds.filter((id, idx) => projectIds.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      setFormError("Duplicate projects selected. Please merge hours into a single row.");
      return false;
    }

    // Check sum <= 24
    const totalHours = projectRows.reduce((sum, row) => sum + row.hours, 0);
    if (totalHours > 24) {
      setFormError("Total daily logged hours cannot exceed 24 hours.");
      return false;
    }

    return true;
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        employeeId: profile!._id,
        date,
        projects: projectRows.map((r) => ({ project: r.projectId, hours: r.hours })),
      };

      await dispatch(createTimesheet(payload)).unwrap();
      setSuccessMsg("Daily hours saved as Draft successfully!");
      setProjectRows([{ projectId: "", hours: 0 }]);
      loadTimesheetData();
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      // Handled by Redux
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        employeeId: profile!._id,
        date,
        projects: projectRows.map((r) => ({ project: r.projectId, hours: r.hours })),
      };

      // Create Draft first
      const draftTimesheet = await dispatch(createTimesheet(payload)).unwrap();
      
      // Submit immediately
      await dispatch(submitTimesheet(draftTimesheet._id)).unwrap();

      setSuccessMsg("Daily hours logged and submitted successfully!");
      setProjectRows([{ projectId: "", hours: 0 }]);
      loadTimesheetData();
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      // Handled by Redux
    }
  };

  const handleActionSubmit = async (timesheetId: string) => {
    setSuccessMsg(null);
    setFormError(null);
    try {
      await dispatch(submitTimesheet(timesheetId)).unwrap();
      setSuccessMsg("Timesheet submitted successfully.");
      loadTimesheetData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err || "Failed to submit timesheet.");
    }
  };

  // Badges status helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold">
            Rejected
          </span>
        );
      case "Submitted":
        return (
          <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold">
            Submitted
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-semibold">
            Draft
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC" // prevent timezone shifting
    });
  };

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
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                WFM Employee
              </h2>
              <span className="text-[10px] text-violet-400 font-semibold tracking-widest uppercase">
                Employee Hub
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <Link
              to="/employee/dashboard"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </Link>
            <Link
              to="/employee/timesheets"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors"
            >
              <FileClock className="w-4 h-4" />
              <span>Timesheets</span>
            </Link>
            <Link
              to="/employee/leaves"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Leaves</span>
            </Link>
            <Link
              to="/employee/profile"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
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

      {/* Main Panel */}
      <main className="flex-1 p-8 overflow-y-auto z-10 max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Timesheet Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Log daily operational hours, save drafts, and submit timesheets for validation.
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span>Employee Mode Active</span>
          </div>
        </header>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {(formError || error) && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Weekly Progress Summary */}
        <section className="glass-panel p-6 rounded-3xl relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Operational Hours Logged This Week</span>
              <h3 className="text-2xl font-extrabold text-slate-200 mt-1">
                {weeklySummary?.totalHours ?? 0} hrs <span className="text-xs font-normal text-slate-500">/ 40 hrs target</span>
              </h3>
            </div>
            <div className="w-full md:w-1/2">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mb-1">
                <span>Absence / Work Progress</span>
                <span>{Math.round(Math.min(100, ((weeklySummary?.totalHours ?? 0) / 40) * 100))}%</span>
              </div>
              <div className="w-full bg-slate-950 border border-slate-900 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((weeklySummary?.totalHours ?? 0) / 40) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Daily Logging Form */}
          <section className="lg:col-span-2">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
              <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
                <FileClock className="w-4 h-4 text-violet-400" />
                <span>Log Daily Hours</span>
              </h2>

              <form className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Date Worked
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-sm cursor-pointer"
                    required
                  />
                </div>

                {/* Project Rows */}
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Project Work Breakout
                  </label>
                  {projectRows.map((row, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-900/45 p-3 rounded-xl border border-slate-900">
                      <div className="flex-1">
                        <select
                          value={row.projectId}
                          onChange={(e) => handleRowChange(idx, "projectId", e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-xs cursor-pointer"
                          required
                        >
                          <option value="">-- Select Project --</option>
                          {projects.map((proj) => (
                            <option key={proj._id} value={proj._id}>
                              {proj.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={row.hours || ""}
                          onChange={(e) => handleRowChange(idx, "hours", e.target.value)}
                          placeholder="hrs"
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2 py-2 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-xs text-center"
                          min="1"
                          max="24"
                          step="0.5"
                          required
                        />
                      </div>
                      {projectRows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full py-2 bg-slate-900/60 hover:bg-slate-900 border border-dashed border-slate-800 text-xs text-violet-400 font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Project Row</span>
                  </button>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 rounded-xl font-semibold text-xs transition-all disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-violet-650/15 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Timesheet Logs History */}
          <section className="lg:col-span-3">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col h-full min-h-[450px]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
              <h2 className="text-base font-bold text-slate-100 mb-6 flex items-center gap-2">
                <FileJson className="w-4 h-4 text-fuchsia-400" />
                <span>Timesheet Logs</span>
              </h2>

              <div className="flex-1 overflow-x-auto">
                {timesheets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16">
                    <AlertTriangle className="w-10 h-10 mb-3 text-slate-600" />
                    <p className="text-sm italic">No logged timesheets found.</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Date Worked</th>
                        <th className="pb-3 px-4">Projects (Breakout)</th>
                        <th className="pb-3 px-4">Total Hrs</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {timesheets.map((ts) => (
                        <tr key={ts._id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 pr-4 font-semibold text-slate-200">
                            {formatDate(ts.date)}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">
                            <div className="space-y-1">
                              {ts.projects.map((proj, pIdx) => (
                                <div key={pIdx}>
                                  <strong className="text-violet-400">{proj.project?.name || "Project"}</strong>: {proj.hours}h
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-slate-200">
                            {ts.totalHours} hrs
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(ts.status)}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            {ts.status === "Draft" ? (
                              <button
                                onClick={() => handleActionSubmit(ts._id)}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                <span>Submit</span>
                              </button>
                            ) : (
                              <span className="text-xs text-slate-600 italic">No Action</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Timesheets;
