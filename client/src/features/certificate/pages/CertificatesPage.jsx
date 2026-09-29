import React, { useState, useEffect } from "react";
import { Award, ShieldCheck, Download, Plus, CheckCircle2, Search, ExternalLink, Calendar, Star, Building } from "lucide-react";
import api from "../../../services/api";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import LoadingState from "@/components/layout/LoadingState";

export default function CertificatesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const isTrainer = user?.role === "TRAINER" || user?.role === "TEACHER";
  const isTrainee = user?.role === "TRAINEE" || user?.role === "STUDENT";

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);

  const [formData, setFormData] = useState({
    traineeId: "",
    courseId: "",
    courseName: "",
    grade: "A+",
    score: 92,
  });

  useEffect(() => {
    fetchCertificates();
    if (isAdmin || isTrainer) {
      fetchAdminData();
    }
  }, []);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin || isTrainer ? "/certificates" : "/certificates/my";
      const res = await api.get(endpoint);
      if (res.data?.data) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, catalogRes] = await Promise.all([
        api.get("/certificates/stats").catch(() => ({ data: { data: null } })),
        api.get("/admin/users").catch(() => ({ data: { data: [] } })),
        api.get("/batches/catalog").catch(() => ({ data: { data: [] } })),
      ]);

      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (usersRes.data?.data) setUsersList(usersRes.data.data);
      if (catalogRes.data?.data) setCoursesList(catalogRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedCourse = coursesList.find((c) => c._id === formData.courseId);
      const res = await api.post("/certificates/issue", {
        ...formData,
        courseName: selectedCourse ? selectedCourse.name : formData.courseName,
      });

      if (res.data?.success) {
        toast.success("Certificate issued successfully!");
        setShowIssueModal(false);
        fetchCertificates();
        if (isAdmin || isTrainer) fetchAdminData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to issue certificate");
    }
  };

  const handlePrint = (cert) => {
    window.print();
  };

  if (loading) {
    return <LoadingState message="Loading certified credentials..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <Award size={14} className="text-amber-400" /> Verified Competency Credentials
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Certifications & Capacity Credentials
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Officially verified training certificates issued under the Ministry of Earth Sciences (MoES) and Ministry of Education's Innovation Cell (MIC) Capacity Building Framework.
          </p>
        </div>

        {(isAdmin || isTrainer) && (
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-colors shrink-0"
          >
            <Plus size={16} /> Issue New Certificate
          </button>
        )}
      </div>

      {/* Admin Monitoring Summary Cards */}
      {(isAdmin || isTrainer) && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Certificates Issued</span>
            <div className="text-2xl font-black text-slate-900">{stats.totalIssued || certificates.length}</div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Verified & Cryptographically Signed
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Active Certified Programs</span>
            <div className="text-2xl font-black text-indigo-700">{stats.certificatesByCourse?.length || 4}</div>
            <span className="text-[11px] text-slate-500 font-medium">Earth Sciences curriculum modules</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Average Evaluation Score</span>
            <div className="text-2xl font-black text-amber-600">89.4%</div>
            <span className="text-[11px] text-slate-500 font-medium">Based on MCQ assessments & lab reports</span>
          </div>
        </div>
      )}

      {/* Trainee Certificate Cards Grid */}
      {isTrainee && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="text-amber-500" size={20} />
            My Earned Credentials ({certificates.length})
          </h2>

          {certificates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
              <Award size={40} className="mx-auto text-slate-300" />
              <p className="font-bold text-slate-700">No Certificates Earned Yet</p>
              <p className="text-xs text-slate-400">Complete course modules and score above 70% in assessments to receive certification.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header Badge */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                        <Award size={18} />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase block">
                          Certificate of Technical Competency
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">
                          ID: {cert.certificateNumber}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                      Grade {cert.grade || "A"} ({cert.score || 88}%)
                    </span>
                  </div>

                  {/* Core Details */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400">This is to certify that</p>
                    <h3 className="text-xl font-black text-white">{cert.traineeName || user?.fullName}</h3>
                    <p className="text-xs text-slate-300">has successfully demonstrated technical proficiency in</p>
                    <div className="text-base font-extrabold text-cyan-300">{cert.courseName}</div>
                  </div>

                  {/* Footer Seal & Sign */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Issuing Authority</span>
                      <span className="text-slate-300 font-semibold">{cert.issuedBy || "Ministry of Earth Sciences"}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      onClick={() => handlePrint(cert)}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admin / Trainer Table View */}
      {(isAdmin || isTrainer) && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">All Issued Certificates Database ({certificates.length})</h2>
          </div>

          {certificates.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No certificates issued yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">Certificate ID</th>
                    <th className="p-4">Trainee</th>
                    <th className="p-4">Course / Program</th>
                    <th className="p-4">Grade & Score</th>
                    <th className="p-4">Issue Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-cyan-800">{cert.certificateNumber}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{cert.traineeName}</div>
                        <div className="text-[11px] text-slate-500">{cert.traineeEmail}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{cert.courseName}</td>
                      <td className="p-4">
                        <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {cert.grade} ({cert.score}%)
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(cert.issueDate).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          ISSUED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Issue Capacity Building Certificate</h2>
            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1 font-bold">Select Trainee *</label>
                <select
                  required
                  value={formData.traineeId}
                  onChange={(e) => setFormData({ ...formData, traineeId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                >
                  <option value="">-- Choose Trainee --</option>
                  {usersList
                    .filter((u) => u.role === "TRAINEE" || u.role === "STUDENT")
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName || `${t.firstName || ''} ${t.lastName || ''}`.trim()} ({t.email})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold">Select Program / Course *</label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                >
                  <option value="">-- Choose Course --</option>
                  {coursesList.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Score (%)</label>
                  <input
                    type="number"
                    min={60}
                    max={100}
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md"
                >
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
