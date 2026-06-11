import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, Briefcase, Plus, X, Save, Calendar, Award, Shield, CheckCircle, ShieldAlert, Compass, FileClock, CalendarDays, LogOut } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProfile, updateProfile, clearEmployeeError } from "../../store/slices/employeeSlice";
import { logoutSuccess } from "../../store/slices/authSlice";

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { profile, loading, error } = useAppSelector((state) => state.employees);
  const { user } = useAppSelector((state) => state.auth);

  // Editable fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(clearEmployeeError());
  }, [dispatch]);

  // Load profile values when fetched
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleAddSkill = (e: React.MouseEvent) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const cleanSkill = skillInput.trim().replace(/,/g, "");
      if (cleanSkill && !skills.includes(cleanSkill)) {
        setSkills([...skills, cleanSkill]);
        setSkillInput("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    dispatch(clearEmployeeError());

    if (!name || !phone) {
      return;
    }

    try {
      await dispatch(updateProfile({ name, phone, skills })).unwrap();
      setSuccess("Profile updated successfully!");
      // Hide banner after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      // Handled by Redux state
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <Link to="/employee/dashboard" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-800 text-slate-400 hover:text-slate-200 text-sm font-medium transition-all">
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
            <Link to="/employee/profile" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 text-sm font-medium transition-colors">
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
      <main className="flex-1 p-8 overflow-y-auto z-10 max-w-4xl mx-auto w-full">
        {/* Header */}
        <header className="mb-8 border-b border-slate-900 pb-5">
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            My Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal details, contact details, and skill tags.
          </p>
        </header>

        {/* Feedback alerts */}
        {success && (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Cards & Leave Balances */}
          <div className="space-y-6">
            {/* User card info */}
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden text-center">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
              
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-violet-600/20">
                {name.charAt(0) || user?.name.charAt(0) || "U"}
              </div>
              
              <h2 className="text-lg font-bold text-slate-100">{name || user?.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold mt-2 uppercase tracking-wide">
                <Shield className="w-3 h-3" />
                {user?.role.name}
              </span>

              <div className="mt-6 border-t border-slate-900 pt-5 text-left space-y-3.5 text-sm">
                <div className="flex items-center gap-3 text-slate-400">
                  <Mail className="w-4 h-4 text-violet-400" />
                  <span className="truncate">{profile?.email || user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <Briefcase className="w-4 h-4 text-violet-400" />
                  <span>{profile?.department || "Department Unassigned"}</span>
                </div>
              </div>
            </div>

            {/* Leave Balances Panel */}
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-500/40 to-transparent"></div>
              
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <span>Leave Balances</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-2xl font-bold text-slate-200">{profile?.casualLeaveBalance ?? 0}</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Casual</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-2xl font-bold text-slate-200">{profile?.sickLeaveBalance ?? 0}</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Sick</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-3 text-center">
                  <span className="text-2xl font-bold text-slate-200">{profile?.earnedLeaveBalance ?? 0}</span>
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wide mt-1">Earned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Edit profile details form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
              
              <h3 className="text-lg font-semibold text-slate-100 mb-6">Profile Settings</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full name input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>

                {/* Contact phone number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                      placeholder="+1 555-0199"
                      required
                    />
                  </div>
                </div>

                {/* Interactive skills input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-violet-400" />
                    <span>My Technical Skills</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleSkillKeyDown}
                      className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all text-sm"
                      placeholder="Type a skill and press Enter or Comma"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-violet-400 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Skills badges display */}
                  <div className="flex flex-wrap gap-2 mt-4 p-4 bg-slate-900/30 border border-slate-900 rounded-2xl min-h-[70px]">
                    {skills.length === 0 ? (
                      <span className="text-xs text-slate-500 italic my-auto">No skills added yet. Add skills to stand out for allocations!</span>
                    ) : (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="text-violet-400 hover:text-violet-200 focus:outline-none"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Save button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-medium text-sm hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/20 flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
