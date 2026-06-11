import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, FileClock, CalendarDays, Compass, Send, CheckCircle, ShieldAlert, AlertTriangle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchProfile } from "../../store/slices/employeeSlice";
import { fetchMyLeaves, applyLeave, fetchLeaveBalance, clearLeaveError } from "../../store/slices/leaveSlice";

const Leaves: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.employees);
  const { myLeaves, balance, loading, error } = useAppSelector((state) => state.leaves);

  // Leave Form State
  const [leaveType, setLeaveType] = useState("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(clearLeaveError());
    if (!profile) {
      dispatch(fetchProfile());
    }
    dispatch(fetchMyLeaves());
  }, [dispatch, profile]);

  useEffect(() => {
    if (profile?._id) {
      dispatch(fetchLeaveBalance(profile._id));
    }
  }, [dispatch, profile?._id]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);
    dispatch(clearLeaveError());

    if (!profile?._id) {
      setFormError("Employee profile not found. Cannot apply.");
      return;
    }

    if (!startDate || !endDate || !reason.trim()) {
      setFormError("All fields are required.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setFormError("End date must be after start date.");
      return;
    }

    // Client-side balance checks
    if (balance) {
      const casualBal = balance.casualLeaveBalance;
      const sickBal = balance.sickLeaveBalance;
      const earnedBal = balance.earnedLeaveBalance;

      if (leaveType === "Casual" && casualBal <= 0) {
        setFormError("No casual leave balance remaining.");
        return;
      }
      if (leaveType === "Sick" && sickBal <= 0) {
        setFormError("No sick leave balance remaining.");
        return;
      }
      if (leaveType === "Earned" && earnedBal <= 0) {
        setFormError("No earned leave balance remaining.");
        return;
      }
    }

    try {
      await dispatch(
        applyLeave({
          employeeId: profile._id,
          leaveType,
          startDate,
          endDate,
          reason,
        })
      ).unwrap();

      setSuccessMsg("Leave application submitted successfully!");
      setStartDate("");
      setEndDate("");
      setReason("");
      
      // Refresh balance and leaves
      dispatch(fetchMyLeaves());
      if (profile?._id) {
        dispatch(fetchLeaveBalance(profile._id));
      }

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      // Handled by Redux error, but we can capture local exceptions if needed
    }
  };

  // Status badge style helper
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
      default:
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
            Pending
          </span>
        );
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all"
            >
              <FileClock className="w-4 h-4" />
              <span>Timesheets</span>
            </Link>
            <Link
              to="/employee/leaves"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors"
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Leave Management</h1>
            <p className="text-xs text-slate-400 mt-1">
              Apply for leave and monitor your leave history and balances.
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span>Employee Mode Active</span>
          </div>
        </header>

        {/* Feedback Alert banners */}
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

        {/* Leave Balances Header Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Casual Leaves</span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{balance?.casualLeaveBalance ?? 0}</h3>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-800">
              <div
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((balance?.casualLeaveBalance ?? 0) / 12) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sick Leaves</span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{balance?.sickLeaveBalance ?? 0}</h3>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-800">
              <div
                className="bg-cyan-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((balance?.sickLeaveBalance ?? 0) / 8) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[120px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Earned Leaves</span>
              <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{balance?.earnedLeaveBalance ?? 0}</h3>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4 border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, ((balance?.earnedLeaveBalance ?? 0) / 15) * 100)}%` }}
              ></div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Apply Leave Form */}
          <section className="lg:col-span-2">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <Send className="w-4 h-4 text-violet-400" />
                <span>Apply for Leave</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Leave Type
                  </label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-sm cursor-pointer"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Earned">Earned Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-sm cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-all text-sm cursor-pointer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Reason / Description
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="Provide a reason for the leave request..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-all text-sm resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg shadow-violet-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Leave History Table */}
          <section className="lg:col-span-3">
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col h-full min-h-[450px]">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
              <h2 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-fuchsia-400" />
                <span>My Leave History</span>
              </h2>

              <div className="flex-1 overflow-x-auto">
                {myLeaves.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                    <AlertTriangle className="w-10 h-10 mb-3 text-slate-600" />
                    <p className="text-sm italic">No leave history found.</p>
                  </div>
                ) : (
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-semibold">
                        <th className="pb-3 pr-4">Type</th>
                        <th className="pb-3 px-4">Dates</th>
                        <th className="pb-3 px-4">Reason</th>
                        <th className="pb-3 px-4">Replacement</th>
                        <th className="pb-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {myLeaves.map((leave) => (
                        <tr key={leave._id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 pr-4 font-medium text-slate-200">
                            {leave.leaveType}
                          </td>
                          <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                            <div>{formatDate(leave.startDate)}</div>
                            <div className="text-[10px] text-slate-500">to {formatDate(leave.endDate)}</div>
                          </td>
                          <td className="py-4 px-4 max-w-[150px] truncate text-slate-400" title={leave.reason}>
                            {leave.reason}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">
                            {leave.replacementEmployee ? (
                              <span className="text-violet-400 font-medium">
                                {(leave.replacementEmployee as any).name || "Assigned"}
                              </span>
                            ) : (
                              <span className="text-slate-600">None</span>
                            )}
                          </td>
                          <td className="py-4 pl-4 text-right">
                            {getStatusBadge(leave.status)}
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

export default Leaves;
