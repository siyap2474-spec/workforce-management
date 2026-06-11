import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Users, FolderKanban, Percent, FileText, Briefcase, Calendar, FileClock, ListTodo, Check, X, AlertTriangle, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchLeaves, fetchLeaveCalendar, approveLeave, rejectLeave, clearLeaveError } from "../../store/slices/leaveSlice";
import { fetchAllocations } from "../../store/slices/allocationSlice";
import { fetchEmployees } from "../../store/slices/employeeSlice";

const LeaveManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { leaves, calendarLeaves, error } = useAppSelector((state) => state.leaves);
  const { allocations } = useAppSelector((state) => state.allocations);
  const { employees } = useAppSelector((state) => state.employees);

  // UI State
  const [activeTab, setActiveTab] = useState<"pending" | "calendar">("pending");
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [replacementId, setReplacementId] = useState("");
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchLeaveCalendar());
    dispatch(fetchAllocations(undefined));
    dispatch(fetchEmployees(undefined));
    dispatch(clearLeaveError());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  // Check if user is Admin or Manager
  const isAdmin = user?.role.name.toLowerCase() === "admin";

  const getActiveAllocations = (employeeId: string) => {
    return allocations.filter(
      (al) => al.employee?._id === employeeId && al.status === "Active"
    );
  };

  const isAssignedToCriticalProject = (employeeId: string) => {
    const active = getActiveAllocations(employeeId);
    return active.some((al) => al.project?.isCriticalProject === true);
  };

  const handleApproveClick = (leave: any) => {
    setLocalError(null);
    setSuccessMsg(null);
    
    const needsReplacement = isAssignedToCriticalProject(leave.employee?._id);

    if (needsReplacement) {
      setSelectedLeave(leave);
      setReplacementId("");
      setShowReplacementModal(true);
    } else {
      // Direct approval
      processApproval(leave._id);
    }
  };

  const processApproval = async (leaveId: string, repId?: string) => {
    try {
      await dispatch(
        approveLeave({
          id: leaveId,
          replacementEmployeeId: repId || undefined,
        })
      ).unwrap();
      
      setSuccessMsg("Leave request approved successfully!");
      setShowReplacementModal(false);
      setSelectedLeave(null);
      
      // Refresh listings
      dispatch(fetchLeaves());
      dispatch(fetchLeaveCalendar());
      dispatch(fetchEmployees(undefined)); // Refresh employee statuses
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to approve leave request.");
    }
  };

  const handleReject = async (leaveId: string) => {
    setLocalError(null);
    setSuccessMsg(null);
    try {
      await dispatch(rejectLeave(leaveId)).unwrap();
      setSuccessMsg("Leave request rejected successfully.");
      dispatch(fetchLeaves());
      dispatch(fetchLeaveCalendar());
      
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setLocalError(err || "Failed to reject leave request.");
    }
  };

  // Calendar Helpers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isToday = (dayNum: number) => {
    const today = new Date();
    return (
      today.getDate() === dayNum &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  // Build Calendar cells
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const calendarCells = [];

  // Blank cells before first day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }

  // Actual day cells
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  const getLeavesForDate = (dayNum: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    return calendarLeaves.filter((leave) => {
      const start = new Date(leave.startDate);
      // set hours to 0 to compare days correctly
      start.setHours(0,0,0,0);
      const end = new Date(leave.endDate);
      end.setHours(23,59,59,999);
      return targetDate >= start && targetDate <= end;
    });
  };

  // Selected Day detailed view
  const [selectedDayDetail, setSelectedDayDetail] = useState<number | null>(null);

  const pendingLeavesCount = leaves.filter((l) => l.status === "Pending").length;

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
                <Link to="/admin/leaves" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
                  <FileClock className="w-4 h-4" />
                  <span>Leaves</span>
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
                <Link to="/admin/leaves" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium transition-colors">
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Leave Approvals & Calendar</h1>
            <p className="text-xs text-slate-400 mt-1">
              Process employee leave applications and monitor organizational availability.
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className={`w-2 h-2 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-indigo-500"}`}></span>
            <span>{isAdmin ? "Admin Console Mode" : "Manager Console Mode"}</span>
          </div>
        </header>

        {/* Success / Error Banners */}
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <Check className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {(localError || error) && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-slate-900 mb-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-4 text-sm font-semibold relative transition-colors ${
              activeTab === "pending" ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Pending Requests
            {pendingLeavesCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-violet-600 text-white rounded-full text-[10px] font-bold">
                {pendingLeavesCount}
              </span>
            )}
            {activeTab === "pending" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`pb-4 text-sm font-semibold relative transition-colors ${
              activeTab === "calendar" ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Leave Calendar
            {activeTab === "calendar" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-violet-500"></span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "pending" ? (
          <section className="glass-panel p-6 rounded-3xl relative overflow-hidden min-h-[400px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            
            <div className="overflow-x-auto">
              {leaves.filter((l) => l.status === "Pending").length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-500 py-16">
                  <UserCheck className="w-12 h-12 mb-3 text-slate-600" />
                  <p className="text-sm italic">All leave requests have been processed.</p>
                </div>
              ) : (
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 font-semibold">
                      <th className="pb-3 pr-4">Employee</th>
                      <th className="pb-3 px-4">Leave Type</th>
                      <th className="pb-3 px-4">Requested Dates</th>
                      <th className="pb-3 px-4">Reason</th>
                      <th className="pb-3 px-4">Risk Status</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900/50">
                    {leaves
                      .filter((l) => l.status === "Pending")
                      .map((leave) => {
                        const isCritical = isAssignedToCriticalProject(leave.employee?._id);
                        return (
                          <tr key={leave._id} className="text-slate-300 hover:bg-slate-900/20 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="font-semibold text-slate-200">{leave.employee?.name}</div>
                              <div className="text-[10px] text-slate-500">{leave.employee?.email}</div>
                            </td>
                            <td className="py-4 px-4 font-medium text-slate-300">
                              {leave.leaveType}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-400">
                              <div>{formatDate(leave.startDate)}</div>
                              <div className="text-[10px] text-slate-500">to {formatDate(leave.endDate)}</div>
                            </td>
                            <td className="py-4 px-4 max-w-[200px] truncate text-slate-400" title={leave.reason}>
                              {leave.reason}
                            </td>
                            <td className="py-4 px-4">
                              {isCritical ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Critical project
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-slate-500 border border-slate-800 rounded-full text-[10px] font-medium uppercase tracking-wider">
                                  Low Risk
                                </span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleApproveClick(leave)}
                                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all"
                                  title="Approve leave"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(leave._id)}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                                  title="Reject leave"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-6">
            {/* Monthly Calendar View */}
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
              
              {/* Month Header Navigation */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-200 uppercase tracking-wide">
                  {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="bg-slate-900/10 min-h-[90px] rounded-2xl border border-transparent"></div>;
                  }

                  const dateLeaves = getLeavesForDate(day);
                  const isSelected = selectedDayDetail === day;

                  return (
                    <div
                      key={`day-${day}`}
                      onClick={() => setSelectedDayDetail(day)}
                      className={`min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isToday(day)
                          ? "bg-violet-600/10 border-violet-500"
                          : isSelected
                          ? "bg-slate-900 border-slate-600"
                          : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70"
                      }`}
                    >
                      <span className={`text-xs font-bold ${isToday(day) ? "text-violet-400" : "text-slate-400"}`}>
                        {day}
                      </span>
                      
                      {/* Leaf Indicator Tags */}
                      <div className="mt-2 space-y-1 overflow-hidden">
                        {dateLeaves.slice(0, 2).map((lv) => (
                          <div
                            key={lv._id}
                            className="px-1.5 py-0.5 bg-fuchsia-600/10 border border-fuchsia-500/25 text-fuchsia-400 rounded-lg text-[9px] font-semibold truncate"
                          >
                            {lv.employee?.name}
                          </div>
                        ))}
                        {dateLeaves.length > 2 && (
                          <div className="text-[8px] text-slate-500 font-bold text-center">
                            +{dateLeaves.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Day Details Panel */}
            {selectedDayDetail && (
              <div className="glass-panel p-6 rounded-3xl relative overflow-hidden animate-fadeIn">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Leaves Scheduled on {currentDate.toLocaleString("default", { month: "short" })} {selectedDayDetail}, {currentDate.getFullYear()}
                  </h4>
                  <button
                    onClick={() => setSelectedDayDetail(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 font-semibold"
                  >
                    Clear Selected
                  </button>
                </div>

                {getLeavesForDate(selectedDayDetail).length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No approved leaves scheduled on this date.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getLeavesForDate(selectedDayDetail).map((leave) => (
                      <div key={leave._id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-bold text-slate-200 text-sm">{leave.employee?.name}</h5>
                              <span className="text-[10px] text-slate-500">{leave.employee?.email}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-full text-[9px] font-bold uppercase">
                              {leave.leaveType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-900">
                            <strong>Reason:</strong> {leave.reason}
                          </p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
                          <span>Dates: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                          {leave.replacementEmployee && (
                            <span className="text-violet-400 font-semibold">
                              Covered by: {(leave.replacementEmployee as any).name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Replacement Employee Selection Modal */}
      {showReplacementModal && selectedLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
            
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse" />
              <h3 className="font-bold text-slate-100 text-base">Replacement Employee Required</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              <strong>{selectedLeave.employee?.name}</strong> is currently assigned to a <strong>critical project</strong>. Under system policies, you must assign a replacement employee to cover their duties before approving this leave request.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (replacementId) {
                  processApproval(selectedLeave._id, replacementId);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Replacement Employee
                </label>
                <select
                  value={replacementId}
                  onChange={(e) => setReplacementId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-amber-500 transition-all text-sm cursor-pointer"
                  required
                >
                  <option value="">-- Choose available employee --</option>
                  {employees
                    .filter((emp) => emp._id !== selectedLeave.employee?._id && !emp.isOnLeave)
                    .map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowReplacementModal(false);
                    setSelectedLeave(null);
                  }}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!replacementId}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
