import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Users, Search, Plus, Edit2, Trash2, Mail, Phone, Briefcase, ToggleLeft, ToggleRight, X, Save, AlertCircle } from "lucide-react";
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, clearEmployeeError } from "../../store/slices/employeeSlice";
import type { IEmployee } from "../../store/slices/employeeSlice";
import api from "../../utils/api";

interface Role {
  _id: string;
  name: string;
  description?: string;
}

const EmployeeManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { employees, loading, error } = useAppSelector((state) => state.employees);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Modals visibility
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployee | null>(null);

  // Form states (Add)
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDepartment, setAddDepartment] = useState("");
  const [addSkills, setAddSkills] = useState<string[]>([]);
  const [addSkillInput, setAddSkillInput] = useState("");

  // Roles state & selection
  const [roles, setRoles] = useState<Role[]>([]);
  const [addRoleId, setAddRoleId] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get("/auth/roles");
        setRoles(response.data);
        if (response.data.length > 0) {
          const empRole = response.data.find(
            (r: Role) => r.name.toLowerCase() === "employee"
          );
          setAddRoleId(empRole ? empRole._id : response.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load roles:", err);
      }
    };
    fetchRoles();
  }, []);

  const getSelectedRoleName = () => {
    const selected = roles.find((r) => r._id === addRoleId);
    return selected ? selected.name.toLowerCase() : "employee";
  };

  const isEmployeeSelected = getSelectedRoleName() === "employee";

  // Form states (Edit)
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editSkillInput, setEditSkillInput] = useState("");
  const [editIsOnLeave, setEditIsOnLeave] = useState(false);
  const [editCasualBalance, setEditCasualBalance] = useState(12);
  const [editSickBalance, setEditSickBalance] = useState(8);
  const [editEarnedBalance, setEditEarnedBalance] = useState(15);

  useEffect(() => {
    dispatch(fetchEmployees(searchTerm));
  }, [dispatch, searchTerm]);

  // Skill Add / Remove logic (Add Form)
  const handleAddSkillToAddForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = addSkillInput.trim();
    if (clean && !addSkills.includes(clean)) {
      setAddSkills([...addSkills, clean]);
      setAddSkillInput("");
    }
  };
  const handleRemoveSkillFromAddForm = (skill: string) => {
    setAddSkills(addSkills.filter((s) => s !== skill));
  };

  // Skill Add / Remove logic (Edit Form)
  const handleAddSkillToEditForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const clean = editSkillInput.trim();
    if (clean && !editSkills.includes(clean)) {
      setEditSkills([...editSkills, clean]);
      setEditSkillInput("");
    }
  };
  const handleRemoveSkillFromEditForm = (skill: string) => {
    setEditSkills(editSkills.filter((s) => s !== skill));
  };

  // Submit Add Employee
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearEmployeeError());

    if (!addName || !addEmail || (isEmployeeSelected && (!addPhone || !addDepartment))) {
      return;
    }

    try {
      const payload: any = {
        name: addName,
        email: addEmail,
        roleId: addRoleId,
      };

      if (isEmployeeSelected) {
        payload.phone = addPhone;
        payload.department = addDepartment;
        payload.skills = addSkills;
      }

      await dispatch(createEmployee(payload)).unwrap();

      // Clear fields and close
      setAddName("");
      setAddEmail("");
      setAddPhone("");
      setAddDepartment("");
      setAddSkills([]);
      setIsAddModalOpen(false);
    } catch (err) {
      // Handled by Redux slice error state
    }
  };

  // Open Edit Modal & Load Info
  const handleOpenEdit = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setEditName(emp.name);
    setEditPhone(emp.phone);
    setEditDepartment(emp.department);
    setEditSkills(emp.skills || []);
    setEditIsOnLeave(emp.isOnLeave);
    setEditCasualBalance(emp.casualLeaveBalance);
    setEditSickBalance(emp.sickLeaveBalance);
    setEditEarnedBalance(emp.earnedLeaveBalance);
    setIsEditModalOpen(true);
  };

  // Submit Edit Employee
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearEmployeeError());

    if (!selectedEmployee || !editName || !editPhone || !editDepartment) {
      return;
    }

    try {
      await dispatch(
        updateEmployee({
          id: selectedEmployee._id,
          data: {
            name: editName,
            phone: editPhone,
            department: editDepartment,
            skills: editSkills,
            isOnLeave: editIsOnLeave,
            casualLeaveBalance: Number(editCasualBalance),
            sickLeaveBalance: Number(editSickBalance),
            earnedLeaveBalance: Number(editEarnedBalance),
          },
        })
      ).unwrap();

      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      // Handled by Redux
    }
  };

  // Open Delete Confirm
  const handleOpenDelete = (emp: IEmployee) => {
    setSelectedEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete Employee
  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    dispatch(clearEmployeeError());

    try {
      await dispatch(deleteEmployee(selectedEmployee._id)).unwrap();
      setIsDeleteModalOpen(false);
      setSelectedEmployee(null);
    } catch (err) {
      // Handled by Redux
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/5 blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 border-b border-slate-900 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 flex items-center gap-3">
              <Users className="w-8 h-8 text-violet-500" />
              <span>Employee Management</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Add, update, and manage employee profile records and leave balances.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </header>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-sm mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-8 relative overflow-hidden flex items-center">
          <Search className="w-5 h-5 text-slate-500 ml-2 mr-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, department, or technical skill..."
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Employees Grid */}
        {loading && employees.length === 0 ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
          </div>
        ) : employees.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center border border-slate-900">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-300">No Employees Found</h3>
            <p className="text-slate-500 text-sm mt-1">Try refining your search queries or add a new employee profile.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <div
                key={emp._id}
                className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between glass-panel-hover"
              >
                <div>
                  {/* Top Bar - Profile Avatar & Status */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-lg">
                      {emp.name.charAt(0)}
                    </div>
                    
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emp.isOnLeave
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${emp.isOnLeave ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                      {emp.isOnLeave ? "On Leave" : "Active"}
                    </span>
                  </div>

                  {/* Name & Role details */}
                  <h3 className="text-lg font-bold text-slate-100 truncate">{emp.name}</h3>
                  
                  {/* Department */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                    <span>{emp.department}</span>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5 mt-4 pt-3 border-t border-slate-900 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{emp.phone}</span>
                    </div>
                  </div>

                  {/* Skills badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5 max-h-[72px] overflow-y-auto">
                    {emp.skills.length === 0 ? (
                      <span className="text-[10px] text-slate-500 italic">No skills registered</span>
                    ) : (
                      emp.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md text-[10px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Bottom Actions & Leave Balances */}
                <div className="mt-6 pt-4 border-t border-slate-900 flex justify-between items-center">
                  <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <div>C: <span className="text-slate-300 font-medium">{emp.casualLeaveBalance}</span></div>
                    <div>S: <span className="text-slate-300 font-medium">{emp.sickLeaveBalance}</span></div>
                    <div>E: <span className="text-slate-300 font-medium">{emp.earnedLeaveBalance}</span></div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(emp)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-violet-400 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(emp)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODAL 1: ADD EMPLOYEE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-violet-500" />
                <span>Create Account & Send Invite</span>
              </h3>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                      placeholder="e.g. user@company.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Portal Role</label>
                    <select
                      value={addRoleId}
                      onChange={(e) => setAddRoleId(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                      required
                    >
                      {roles.map((role) => (
                        <option key={role._id} value={role._id} className="bg-slate-950">
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {isEmployeeSelected && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                        <input
                          type="text"
                          value={addPhone}
                          onChange={(e) => setAddPhone(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                          placeholder="Contact number"
                          required={isEmployeeSelected}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Department</label>
                        <input
                          type="text"
                          value={addDepartment}
                          onChange={(e) => setAddDepartment(e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                          placeholder="e.g. Sales, Dev, HR"
                          required={isEmployeeSelected}
                        />
                      </div>
                    </div>

                    {/* Skills tags add form */}
                    <div className="animate-fadeIn">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Skills</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={addSkillInput}
                          onChange={(e) => setAddSkillInput(e.target.value)}
                          className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                          placeholder="Enter skill"
                        />
                        <button
                          type="button"
                          onClick={handleAddSkillToAddForm}
                          className="px-3 bg-slate-800 border border-slate-700 text-violet-400 rounded-xl flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {addSkills.length > 0 && (
                         <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-slate-900/30 border border-slate-900 rounded-xl">
                          {addSkills.map((sk) => (
                            <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold">
                              {sk}
                              <button type="button" onClick={() => handleRemoveSkillFromAddForm(sk)}>
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Create & Send Invite</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT EMPLOYEE */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2.5">
                <Edit2 className="w-5 h-5 text-violet-500" />
                <span>Edit Employee Profile</span>
              </h3>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Department</label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Leave toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-900/40 border border-slate-850 rounded-2xl">
                  <div>
                    <span className="block text-sm font-semibold text-slate-200">On Leave Status</span>
                    <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wide">Toggle current employee availability</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditIsOnLeave(!editIsOnLeave)}
                    className="text-violet-400 hover:text-violet-300 focus:outline-none"
                  >
                    {editIsOnLeave ? (
                      <ToggleRight className="w-10 h-10 text-violet-500" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-slate-600" />
                    )}
                  </button>
                </div>

                {/* Leave balances */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Leave Balances</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1 text-center font-bold">Casual</span>
                      <input
                        type="number"
                        value={editCasualBalance}
                        onChange={(e) => setEditCasualBalance(Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500 text-center text-sm"
                        required
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1 text-center font-bold">Sick</span>
                      <input
                        type="number"
                        value={editSickBalance}
                        onChange={(e) => setEditSickBalance(Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500 text-center text-sm"
                        required
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500 uppercase tracking-wider mb-1 text-center font-bold">Earned</span>
                      <input
                        type="number"
                        value={editEarnedBalance}
                        onChange={(e) => setEditEarnedBalance(Number(e.target.value))}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-violet-500 text-center text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Skills edits */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Skills</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editSkillInput}
                      onChange={(e) => setEditSkillInput(e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-violet-500 text-sm"
                      placeholder="Enter skill"
                    />
                    <button
                      onClick={handleAddSkillToEditForm}
                      className="px-3 bg-slate-800 border border-slate-700 text-violet-400 rounded-xl flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3 p-3 bg-slate-900/30 border border-slate-900 rounded-xl max-h-[100px] overflow-y-auto">
                    {editSkills.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No skills added</span>
                    ) : (
                      editSkills.map((sk) => (
                        <span key={sk} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-semibold">
                          {sk}
                          <button type="button" onClick={() => handleRemoveSkillFromEditForm(sk)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Details</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: DELETE CONFIRMATION */}
        {isDeleteModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-2xl relative text-center">
              <h3 className="text-xl font-bold text-slate-100 mb-2">Delete Employee Profile?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Are you sure you want to delete the profile for <strong className="text-slate-200">{selectedEmployee.name}</strong>? This will remove their workforce profile records permanently.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-sm transition-colors shadow-lg shadow-rose-600/20"
                >
                  {loading ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;
