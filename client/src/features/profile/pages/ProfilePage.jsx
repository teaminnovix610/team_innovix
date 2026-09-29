import React, { useState, useEffect } from "react";
import { User, GraduationCap, Briefcase, Award, Sparkles, Plus, Trash2, Save, Building, CheckCircle2 } from "lucide-react";
import useProfile from "../hooks/useProfile";
import useUpdateProfile from "../hooks/useUpdateProfile";
import useAuth from "@/hooks/useAuth";
import LoadingState from "@/components/layout/LoadingState";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { data, isLoading } = useProfile();
  const mutation = useUpdateProfile();

  const user = data?.user;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    organization: "",
    bio: "",
    skillsInput: "",
    interestsInput: "",
  });

  const [qualifications, setQualifications] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        organization: user.organization || "Ministry of Earth Sciences (MoES)",
        bio: user.bio || "",
        skillsInput: (user.skills || []).join(", "),
        interestsInput: (user.interests || []).join(", "),
      });

      setQualifications(user.qualifications?.length ? user.qualifications : [
        { degree: "M.Sc", field: "Earth Sciences / Oceanography", institution: "IIT Madras", year: "2022" }
      ]);

      setWorkExperience(user.workExperience?.length ? user.workExperience : [
        { organization: "MoES Research Wing", designation: "Junior Research Officer", domain: "Marine Analytics", years: 3, current: true }
      ]);

      setCertificates(user.certificates?.length ? user.certificates : [
        { title: "Ocean System Modeling Certificate", issuer: "INCOIS", issueDate: "2024", credentialId: "MOES-2024-884" }
      ]);
    }
  }, [user]);

  const handleAddQualification = () => {
    setQualifications([...qualifications, { degree: "", field: "", institution: "", year: "" }]);
  };

  const handleRemoveQualification = (idx) => {
    setQualifications(qualifications.filter((_, i) => i !== idx));
  };

  const handleAddExperience = () => {
    setWorkExperience([...workExperience, { organization: "", designation: "", domain: "", years: 1, current: false }]);
  };

  const handleRemoveExperience = (idx) => {
    setWorkExperience(workExperience.filter((_, i) => i !== idx));
  };

  const handleAddCertificate = () => {
    setCertificates([...certificates, { title: "", issuer: "", issueDate: "", credentialId: "" }]);
  };

  const handleRemoveCertificate = (idx) => {
    setCertificates(certificates.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skills = formData.skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    const interests = formData.interestsInput.split(",").map((i) => i.trim()).filter(Boolean);

    mutation.mutate({
      ...formData,
      skills,
      interests,
      qualifications,
      workExperience,
      certificates,
    });
  };

  if (isLoading) {
    return <LoadingState message="Loading professional profile..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user?.firstName?.[0] || "U"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="bg-cyan-500/20 text-cyan-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                {user?.role || "TRAINEE"}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Building size={12} /> {user?.organization || "Ministry of Earth Sciences"}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-colors"
        >
          <Save size={16} /> {mutation.isPending ? "Saving..." : "Save Professional Profile"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 text-xs font-medium text-slate-700">
        {/* Personal & Organization Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-cyan-700" /> Basic Information & Organization
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-700">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-700">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-bold text-slate-700">Email Address (Read-Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full p-2.5 border border-slate-200 bg-slate-50 text-slate-500 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-700">Mobile Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Organization / Department</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              placeholder="e.g. Ministry of Earth Sciences, IMD, INCOIS, NIOT, IIT..."
              className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Professional Bio & Executive Summary</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Summary of research focus, capacity building goals, or technical domain background..."
              className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        {/* Qualifications Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap size={18} className="text-cyan-700" /> Academic & Professional Qualifications
            </h2>
            <button
              type="button"
              onClick={handleAddQualification}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add Qualification
            </button>
          </div>

          <div className="space-y-3">
            {qualifications.map((q, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Qualification #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQualification(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g., M.Tech, Ph.D.)"
                    value={q.degree}
                    onChange={(e) => {
                      const copy = [...qualifications];
                      copy[idx].degree = e.target.value;
                      setQualifications(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Field / Major"
                    value={q.field}
                    onChange={(e) => {
                      const copy = [...qualifications];
                      copy[idx].field = e.target.value;
                      setQualifications(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Institution / University"
                    value={q.institution}
                    onChange={(e) => {
                      const copy = [...qualifications];
                      copy[idx].institution = e.target.value;
                      setQualifications(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Passing Year"
                    value={q.year}
                    onChange={(e) => {
                      const copy = [...qualifications];
                      copy[idx].year = e.target.value;
                      setQualifications(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase size={18} className="text-cyan-700" /> Work Experience & Domain History
            </h2>
            <button
              type="button"
              onClick={handleAddExperience}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add Experience
            </button>
          </div>

          <div className="space-y-3">
            {workExperience.map((exp, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Experience #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Organization Name"
                    value={exp.organization}
                    onChange={(e) => {
                      const copy = [...workExperience];
                      copy[idx].organization = e.target.value;
                      setWorkExperience(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Designation / Role"
                    value={exp.designation}
                    onChange={(e) => {
                      const copy = [...workExperience];
                      copy[idx].designation = e.target.value;
                      setWorkExperience(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Domain Area"
                    value={exp.domain}
                    onChange={(e) => {
                      const copy = [...workExperience];
                      copy[idx].domain = e.target.value;
                      setWorkExperience(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Years of Exp"
                    value={exp.years}
                    onChange={(e) => {
                      const copy = [...workExperience];
                      copy[idx].years = Number(e.target.value);
                      setWorkExperience(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills & Focus Areas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles size={18} className="text-cyan-700" /> Skills & Focus Areas (Comma Separated)
          </h2>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Technical & Competency Skills</label>
            <input
              type="text"
              value={formData.skillsInput}
              onChange={(e) => setFormData({ ...formData, skillsInput: e.target.value })}
              placeholder="e.g. Oceanography, Python, WRF Climate Model, GIS, Remote Sensing, Seismology"
              className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Interests & Research Focus Areas</label>
            <input
              type="text"
              value={formData.interestsInput}
              onChange={(e) => setFormData({ ...formData, interestsInput: e.target.value })}
              placeholder="e.g. Tsunami Warning Systems, Deep Sea Exploration, AI in Earth Sciences"
              className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
            />
          </div>
        </div>

        {/* Certificates Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-amber-500" /> Certificates & Credentials
            </h2>
            <button
              type="button"
              onClick={handleAddCertificate}
              className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add Certificate
            </button>
          </div>

          <div className="space-y-3">
            {certificates.map((cert, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Certificate #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCertificate(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Certificate Title"
                    value={cert.title}
                    onChange={(e) => {
                      const copy = [...certificates];
                      copy[idx].title = e.target.value;
                      setCertificates(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Issuing Authority (e.g. INCOIS / MoES)"
                    value={cert.issuer}
                    onChange={(e) => {
                      const copy = [...certificates];
                      copy[idx].issuer = e.target.value;
                      setCertificates(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Credential ID / Issue Date"
                    value={cert.credentialId || cert.issueDate}
                    onChange={(e) => {
                      const copy = [...certificates];
                      copy[idx].credentialId = e.target.value;
                      setCertificates(copy);
                    }}
                    className="p-2 border border-slate-200 bg-white rounded-lg outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-8 py-3 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-2xl text-sm shadow-md transition-colors"
          >
            {mutation.isPending ? "Saving Profile..." : "Save Professional Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}