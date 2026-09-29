import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  Building,
  Mail,
  Phone,
  Eye,
  GraduationCap,
  Briefcase,
  Award,
  Sparkles,
  Power,
} from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";
import LoadingState from "@/components/layout/LoadingState";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [approvalFilter, setApprovalFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, approvalFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/users", {
        params: { role: roleFilter, approval: approvalFilter, search },
      });
      if (res.data?.data) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleApproval = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/approve`, {
        isApproved: !currentStatus,
      });
      if (res.data?.success) {
        toast.success(`User approval status updated`);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to update user approval");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentStatus,
      });
      if (res.data?.success) {
        toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to update account status");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        toast.success(`User role updated to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error("Failed to change role");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-cyan-700" size={28} />
            User Management & Role Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review registration requests, approve Trainers, manage role permissions, and activate/deactivate accounts across the CAPACITY CONNECT platform.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, or organization..."
              className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="TRAINEE">Trainee</option>
              <option value="TRAINER">Trainer</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending Approval</option>
              <option value="APPROVED">Approved Only</option>
            </select>

            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading user database...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">No users match the search criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Approval</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-900 font-bold flex items-center justify-center text-xs">
                          {u.firstName?.[0] || "U"}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">
                            {u.fullName || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Mail size={10} /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role changer */}
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="bg-white border border-slate-200 text-[11px] font-bold text-slate-800 px-2.5 py-1 rounded-lg outline-none cursor-pointer hover:border-cyan-500 shadow-sm"
                      >
                        <option value="TRAINEE">TRAINEE</option>
                        <option value="TRAINER">TRAINER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>

                    {/* Organization */}
                    <td className="p-4 text-slate-600">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <Building size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{u.organization || "Ministry of Earth Sciences"}</span>
                      </span>
                    </td>

                    {/* Approval */}
                    <td className="p-4">
                      {u.isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <CheckCircle size={11} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 animate-pulse">
                          <XCircle size={11} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Account Status (Active/Inactive) */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(u._id, u.isActive !== false)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          u.isActive !== false
                            ? "bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100"
                            : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                        }`}
                        title="Click to toggle account activation"
                      >
                        <Power size={10} /> {u.isActive !== false ? "Active" : "Deactivated"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                        title="View Full Profile Details"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleToggleApproval(u._id, u.isApproved)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          u.isApproved
                            ? "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700"
                            : "bg-cyan-700 hover:bg-cyan-800 text-white"
                        }`}
                      >
                        {u.isApproved ? "Revoke" : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-700 text-white font-black text-lg flex items-center justify-center">
                  {selectedUser.firstName?.[0] || "U"}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedUser.fullName || selectedUser.firstName}</h3>
                  <p className="text-xs text-slate-500">{selectedUser.email} · {selectedUser.phone || "No phone"}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 uppercase">
                {selectedUser.role}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Organization</span>
                <span className="font-semibold text-slate-800 text-sm">{selectedUser.organization || "Ministry of Earth Sciences"}</span>
              </div>

              {selectedUser.bio && (
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Bio</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}

              {/* Qualifications */}
              {selectedUser.qualifications?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    <GraduationCap size={12} className="inline mr-1" /> Qualifications
                  </span>
                  <div className="space-y-1">
                    {selectedUser.qualifications.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{q.degree}</span> in {q.field} ({q.institution}, {q.year})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {selectedUser.workExperience?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                    <Briefcase size={12} className="inline mr-1" /> Experience
                  </span>
                  <div className="space-y-1">
                    {selectedUser.workExperience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-800">{exp.designation}</span> at {exp.organization} — {exp.years} Years ({exp.domain})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {selectedUser.skills?.length > 0 && (
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1.5">
                    <Sparkles size={12} className="inline mr-1" /> Verified Skills
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.skills.map((s, idx) => (
                      <span key={idx} className="bg-cyan-50 text-cyan-800 px-2.5 py-0.5 rounded-lg font-medium border border-cyan-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
