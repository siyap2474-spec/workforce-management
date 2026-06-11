import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut, Shield, Users, FolderKanban, Percent, FileText, Briefcase, Calendar, FileClock, ListTodo, Download, Search, AlertTriangle, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchUtilizationReport, fetchProjectReport, fetchLeaveReport, clearReportsError } from "../../store/slices/reportSlice";

const Reports: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { utilizationReport, projectReport, leaveReport, loading, error } = useAppSelector((state) => state.reports);

  const [activeTab, setActiveTab] = useState<"utilization" | "projects" | "leaves">("utilization");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(clearReportsError());
    if (activeTab === "utilization") {
      dispatch(fetchUtilizationReport());
    } else if (activeTab === "projects") {
      dispatch(fetchProjectReport());
    } else if (activeTab === "leaves") {
      dispatch(fetchLeaveReport());
    }
  }, [dispatch, activeTab]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const isAdmin = user?.role.name.toLowerCase() === "admin";

  // CSV Exporter
  const handleExport = () => {
    let headers: string[] = [];
    let keys: string[] = [];
    let csvData: any[] = [];
    let fileName = "";

    if (activeTab === "utilization") {
      headers = ["Employee Name", "Active Allocation %", "Approved Logged Hours", "Utilization %"];
      keys = ["employeeName", "allocationPercentage", "actualHours", "utilizationPercentage"];
      csvData = filteredUtilization;
      fileName = `resource-utilization-report-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (activeTab === "projects") {
      headers = ["Project Name", "Allocated Resources", "Total Hours Logged", "Completion Status"];
      keys = ["project", "allocatedResources", "totalHours", "completionStatus"];
      csvData = filteredProjects;
      fileName = `project-tracking-report-${new Date().toISOString().split("T")[0]}.csv`;
    } else if (activeTab === "leaves") {
      headers = ["Department", "Employee Name", "Approved Leaves Count"];
      keys = ["department", "employeeName", "approvedLeaves"];
      csvData = filteredLeaves;
      fileName = `leaves-summary-report-${new Date().toISOString().split("T")[0]}.csv`;
    }

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        keys.map((key) => {
          const value = row[key] !== undefined && row[key] !== null ? row[key] : "";
          let formattedValue = "";
          if (Array.isArray(value)) {
            formattedValue = value.map((item: any) => item.name || item).join("; ");
          } else {
            formattedValue = String(value);
          }
          const escaped = formattedValue.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(",")
      ),
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Logic
  const filteredUtilization = utilizationReport.filter((item) =>
    item.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projectReport.filter((item) =>
    item.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = leaveReport.filter(
    (item) =>
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <Link to="/admin/availability" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Users className="w-4 h-4" />
                  <span>Availability</span>
                </Link>
                <Link to="/admin/reports" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
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
                <Link to="/admin/availability" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
                  <Users className="w-4 h-4" />
                  <span>Availability</span>
                </Link>
                <Link to="/admin/reports" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium transition-colors">
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">
              Generate, audit, and export organization-wide workforce metrics.
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

        {/* Tab Selection Row */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-2 bg-slate-900/60 p-1 border border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => {
                setActiveTab("utilization");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "utilization"
                  ? isAdmin
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/15"
                    : "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Resource Utilization
            </button>
            <button
              onClick={() => {
                setActiveTab("projects");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "projects"
                  ? isAdmin
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/15"
                    : "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Project Status & Tracking
            </button>
            <button
              onClick={() => {
                setActiveTab("leaves");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === "leaves"
                  ? isAdmin
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/15"
                    : "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-600/15"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Leave Summary
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-64">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder={
                  activeTab === "utilization"
                    ? "Search employee..."
                    : activeTab === "projects"
                    ? "Search project..."
                    : "Search employee/department..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-slate-200 placeholder-slate-500 text-xs focus:outline-none w-full"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExport}
              disabled={loading || (activeTab === "utilization" && utilizationReport.length === 0) || (activeTab === "projects" && projectReport.length === 0) || (activeTab === "leaves" && leaveReport.length === 0)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isAdmin
                  ? "bg-violet-600/10 border-violet-500/20 text-violet-400 hover:bg-violet-650/20 disabled:opacity-50"
                  : "bg-fuchsia-600/10 border-fuchsia-500/20 text-fuchsia-400 hover:bg-fuchsia-650/20 disabled:opacity-50"
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </section>

        {/* Report Content Panel */}
        <section className="glass-panel p-6 rounded-3xl relative overflow-hidden min-h-[450px]">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent"></div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "utilization" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Active Allocation %</th>
                        <th className="py-3 px-4">Approved Logged Hours</th>
                        <th className="py-3 px-4">Utilization Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredUtilization.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 italic">No records found.</td>
                        </tr>
                      ) : (
                        filteredUtilization.map((item, index) => {
                          let statusBg = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                          let statusText = "0% Unallocated";
                          if (item.utilizationPercentage === 100) {
                            statusBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                            statusText = "Fully Allocated";
                          } else if (item.utilizationPercentage > 0) {
                            statusBg = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                            statusText = "Partially Allocated";
                          }

                          return (
                            <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-200">{item.employeeName}</td>
                              <td className="py-3.5 px-4 text-slate-300">{item.allocationPercentage}%</td>
                              <td className="py-3.5 px-4 text-slate-300">{item.actualHours} hrs</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${statusBg}`}>
                                  {statusText} ({item.utilizationPercentage}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Project</th>
                        <th className="py-3 px-4">Allocated Resources</th>
                        <th className="py-3 px-4">Total Hours Logged</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 italic">No records found.</td>
                        </tr>
                      ) : (
                        filteredProjects.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-200">{item.project}</td>
                            <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={item.allocatedResources.map(r => r.name).join(", ")}>
                              {item.allocatedResources.length === 0 ? (
                                <span className="text-slate-500 italic">None</span>
                              ) : (
                                item.allocatedResources.map((res) => res.name).join(", ")
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">{item.totalHours} hrs</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-bold ${
                                item.completionStatus === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              }`}>
                                {item.completionStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "leaves" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Employee</th>
                        <th className="py-3 px-4">Approved Leaves</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                      {filteredLeaves.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500 italic">No records found.</td>
                        </tr>
                      ) : (
                        filteredLeaves.map((item, index) => (
                          <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-300">{item.department || "Unassigned"}</td>
                            <td className="py-3.5 px-4 text-slate-200">{item.employeeName}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                                item.approvedLeaves > 0
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}>
                                {item.approvedLeaves} leaves
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Reports;
