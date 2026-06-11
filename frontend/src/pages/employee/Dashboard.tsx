import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, User, FileClock, CalendarDays, Compass, AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutSuccess } from "../../store/slices/authSlice";
import { fetchEmployeeDashboard } from "../../store/slices/dashboardSlice";

interface ITask {
  id: string;
  text: string;
  completed: boolean;
}

const EmployeeDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { employeeData, loading, error } = useAppSelector((state) => state.dashboard);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchEmployeeDashboard(user._id));
    }
  }, [dispatch, user]);

  // Tasks localStorage Sync
  useEffect(() => {
    if (user?.email) {
      const storedTasks = localStorage.getItem(`tasks_${user.email}`);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      } else {
        const defaultTasks: ITask[] = [
          { id: "1", text: "Submit timesheet logs for current allocations", completed: false },
          { id: "2", text: "Review active project allocations timeline", completed: true },
          { id: "3", text: "Submit leave request if needed", completed: false },
        ];
        setTasks(defaultTasks);
        localStorage.setItem(`tasks_${user.email}`, JSON.stringify(defaultTasks));
      }
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const saveTasks = (updatedTasks: ITask[]) => {
    setTasks(updatedTasks);
    if (user?.email) {
      localStorage.setItem(`tasks_${user.email}`, JSON.stringify(updatedTasks));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask: ITask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      completed: false,
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setNewTaskText("");
  };

  const handleToggleTask = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter((task) => task.id !== id);
    saveTasks(updated);
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
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-violet-650/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-650/5 blur-[120px] pointer-events-none"></div>

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
            <Link to="/employee/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
              <Compass className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </Link>
            <Link to="/employee/timesheets" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
              <FileClock className="w-4 h-4" />
              <span>Timesheets</span>
            </Link>
            <Link to="/employee/leaves" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
              <CalendarDays className="w-4 h-4" />
              <span>Leaves</span>
            </Link>
            <Link to="/employee/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
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

      {/* Main panel */}
      <main className="flex-1 p-8 overflow-y-auto z-10 max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-8 border-b border-slate-900 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Employee Dashboard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Welcome back, {user?.name} ({user?.email})
            </p>
          </div>
          <div className="flex items-center gap-3 p-1 px-3 bg-slate-900 border border-slate-800 rounded-full text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span>Employee Mode Active</span>
          </div>
        </header>

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && !employeeData ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          employeeData && (
            <div className="space-y-8 animate-fadeIn">
              {/* Metric Cards Row */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Approved Logged Hours</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{employeeData.monthlyHours} hrs</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-rose-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Casual Leave Balance</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{employeeData.leaveBalance.casual} days</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sick Leave Balance</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{employeeData.leaveBalance.sick} days</h3>
                </div>

                <div className="glass-panel p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between min-h-[110px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earned Leave Balance</span>
                  <h3 className="text-3xl font-extrabold text-slate-100 mt-2">{employeeData.leaveBalance.earned} days</h3>
                </div>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Allocations Table */}
                <section className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col min-h-[350px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">My Active Projects & Allocations</h2>

                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Project</th>
                          <th className="py-3 px-4">Allocation %</th>
                          <th className="py-3 px-4">Period</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/50">
                        {employeeData.currentProjects.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-500 italic">You are not currently allocated to any projects.</td>
                          </tr>
                        ) : (
                          employeeData.currentProjects.map((alloc) => (
                            <tr key={alloc._id} className="hover:bg-slate-900/10 transition-colors">
                              <td className="py-3.5 px-4 font-semibold text-slate-200">{alloc.project?.name}</td>
                              <td className="py-3.5 px-4 text-slate-300 font-bold">{alloc.allocationPercentage}%</td>
                              <td className="py-3.5 px-4 text-slate-400 font-medium">
                                {formatDate(alloc.startDate)} - {formatDate(alloc.endDate)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="px-2 py-0.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 rounded-full text-[10px] font-bold">
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

                {/* Today's Tasks Interactive Checklist */}
                <section className="glass-panel p-6 rounded-3xl relative overflow-hidden flex flex-col min-h-[350px]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/30 to-transparent"></div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Today's Tasks</h2>
                    <span className="text-[10px] bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 px-2 py-0.5 rounded-full font-bold">
                      {tasks.filter((t) => t.completed).length}/{tasks.length} Completed
                    </span>
                  </div>

                  {/* Task Addition Form */}
                  <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add a new daily task..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700"
                    />
                    <button
                      type="submit"
                      className="p-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl transition-all shadow-md shadow-violet-600/10 flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[220px]">
                    {tasks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-12">No tasks added for today. Add one above!</p>
                    ) : (
                      tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between bg-slate-900/40 border border-slate-900/60 p-3 rounded-2xl group transition-all"
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(task.id)}
                              className="w-4 h-4 rounded border-slate-800 text-violet-600 bg-slate-950 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className={`text-xs ${task.completed ? "line-through text-slate-500" : "text-slate-300"}`}>
                              {task.text}
                            </span>
                          </label>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
