import React, { useState, useEffect } from "react";
import {
  Compass,
  Search,
  Filter,
  Award,
  CheckCircle2,
  Sliders,
  Star,
  Building,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";
import LoadingState from "@/components/layout/LoadingState";

const PRESET_SUBJECTS = [
  "Oceanography",
  "Meteorology",
  "Seismology",
  "Climate Science",
  "Remote Sensing",
  "AI in Earth Sciences",
  "Coastal Science",
  "Geophysics",
];

const COMPETENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

export default function CompetencyMappingPage() {
  const [domains, setDomains] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("Oceanography");
  const [requiredCompetencies, setRequiredCompetencies] = useState([
    { name: "Wave Modeling", level: "Advanced" },
    { name: "Hydrodynamics", level: "Expert" },
  ]);
  const [newCompName, setNewCompName] = useState("");
  const [newCompLevel, setNewCompLevel] = useState("Advanced");

  const [minExperience, setMinExperience] = useState(5);
  const [showConfigWeights, setShowConfigWeights] = useState(false);
  const [weights, setWeights] = useState({
    subject: 0.3,
    competency: 0.3,
    qualification: 0.15,
    experience: 0.15,
    performance: 0.1,
  });

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState({});
  const [assigningId, setAssigningId] = useState(null);

  const handleAssignToProgram = async (tr) => {
    setAssigningId(tr.id);
    try {
      const payload = {
        name: selectedSubject,
        classLevel: "1",
        teacherId: tr.id,
        category: "Earth Sciences",
        description: `Capacity building training program in ${selectedSubject}, assigned via Competency Mapping Engine.`,
      };
      await api.post("/batches/assigned-course", payload);
      toast.success(`Assigned ${tr.fullName} to lead ${selectedSubject} training program!`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to assign ${tr.fullName} to ${selectedSubject}`);
    } finally {
      setAssigningId(null);
    }
  };

  useEffect(() => {
    fetchDomains();
    runMatching();
  }, []);

  const fetchDomains = async () => {
    try {
      const res = await api.get("/competency/domains");
      if (res.data?.data) {
        setDomains(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runMatching = async () => {
    setLoading(true);
    try {
      const res = await api.post("/competency/match-requirement", {
        subject: selectedSubject,
        requiredCompetencies,
        minExperience,
        weights,
      });

      if (res.data?.data) {
        setTrainers(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to run competency matching algorithm");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetency = () => {
    if (!newCompName.trim()) return;
    setRequiredCompetencies([
      ...requiredCompetencies,
      { name: newCompName.trim(), level: newCompLevel },
    ]);
    setNewCompName("");
  };

  const handleRemoveCompetency = (idx) => {
    setRequiredCompetencies(requiredCompetencies.filter((_, i) => i !== idx));
  };

  const toggleExpand = (id) => {
    setExpandedReasons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Compass size={14} className="animate-spin-slow" /> Transparent Rule-Based Matching System
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Competency Mapping & Trainer Discovery Engine
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Match optimal subject matter trainers for organizational training requirements based on Subject alignment, Skill competency levels, Academic qualifications, Experience tenure, and Performance ratings.
          </p>
        </div>
      </div>

      {/* Training Requirement Form (Admin Interface) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-cyan-700" size={20} />
              Training Requirement Specification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Define the curriculum domain and competency levels to identify suitable trainers.
            </p>
          </div>

          <button
            onClick={() => setShowConfigWeights(!showConfigWeights)}
            className="text-xs text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-1.5 bg-cyan-50 px-3 py-1.5 rounded-xl border border-cyan-100"
          >
            <Sliders size={14} /> {showConfigWeights ? "Hide Weight Configuration" : "Configure Algorithm Weights"}
          </button>
        </div>

        {/* Configurable Weight Sliders (Expandable) */}
        {showConfigWeights && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs font-medium text-slate-700">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold">
              <Info size={14} className="text-cyan-700" /> Transparent Scoring Weight Formula:
              <span className="font-mono text-cyan-900 ml-1">
                Score = (Sub × {Math.round(weights.subject * 100)}%) + (Comp × {Math.round(weights.competency * 100)}%) + (Qual × {Math.round(weights.qualification * 100)}%) + (Exp × {Math.round(weights.experience * 100)}%) + (Perf × {Math.round(weights.performance * 100)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block mb-1 font-bold">Subject Match: {Math.round(weights.subject * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={weights.subject}
                  onChange={(e) => setWeights({ ...weights, subject: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Competency Match: {Math.round(weights.competency * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={weights.competency}
                  onChange={(e) => setWeights({ ...weights, competency: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Qualification: {Math.round(weights.qualification * 100)}%</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.qualification}
                  onChange={(e) => setWeights({ ...weights, qualification: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Experience: {Math.round(weights.experience * 100)}%</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.experience}
                  onChange={(e) => setWeights({ ...weights, experience: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-700 cursor-pointer"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Performance Index: {Math.round(weights.performance * 100)}%</label>
                <input
                  type="range"
                  min="0.05"
                  max="0.3"
                  step="0.05"
                  value={weights.performance}
                  onChange={(e) => setWeights({ ...weights, performance: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Required Subject */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              1. Target Subject Domain *
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedSubject === sub
                      ? "bg-cyan-700 text-white shadow-sm ring-2 ring-cyan-600/30"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Min Experience */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              2. Minimum Required Domain Experience ({minExperience}+ Years)
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={minExperience}
              onChange={(e) => setMinExperience(Number(e.target.value))}
              className="w-full accent-cyan-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>1 Year (Junior)</span>
              <span>5 Years (Standard)</span>
              <span>10+ Years (Senior Lead)</span>
            </div>
          </div>
        </div>

        {/* Required Competencies */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-800">
            3. Required Competencies & Proficiency Levels
          </label>

          <div className="flex flex-wrap gap-2">
            {requiredCompetencies.map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs px-3 py-1.5 rounded-xl font-bold"
              >
                <span>{comp.name}</span>
                <span className="text-[10px] bg-cyan-200 text-cyan-800 px-1.5 py-0.5 rounded font-mono uppercase">
                  {comp.level}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveCompetency(idx)}
                  className="text-cyan-700 hover:text-rose-600 ml-1"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md pt-1">
            <input
              type="text"
              value={newCompName}
              onChange={(e) => setNewCompName(e.target.value)}
              placeholder="e.g. Wave Modeling, Python, WRF, SAR..."
              className="flex-1 p-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-cyan-600 font-medium"
            />
            <select
              value={newCompLevel}
              onChange={(e) => setNewCompLevel(e.target.value)}
              className="p-2 text-xs border border-slate-200 rounded-xl outline-none font-bold bg-white"
            >
              {COMPETENCY_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddCompetency}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={runMatching}
            disabled={loading}
            className="px-8 py-3 bg-cyan-700 hover:bg-cyan-800 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all"
          >
            <Compass size={16} /> {loading ? "Evaluating Trainers..." : "Run Transparent Matching"}
          </button>
        </div>
      </div>

      {/* Matching Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              Ranked Suitable Trainers ({trainers.length})
            </h2>
            <p className="text-xs text-slate-500">
              Ranked transparently by weighted score for {selectedSubject}.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">Sorted by Overall Match %</span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-700 border-t-transparent" />
            <p className="text-xs font-medium text-slate-500 mt-2">Computing 5-factor competency vectors...</p>
          </div>
        ) : trainers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No trainers found for this requirement.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainers.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Trainer Profile Top */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-700 to-blue-800 text-white font-black text-lg flex items-center justify-center shadow-md">
                        {tr.fullName?.[0] || "T"}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">{tr.fullName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                          <Building size={12} /> {tr.organization}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                        {tr.scores.overallMatch}% Overall Match
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mt-1">
                        <Star size={12} className="fill-amber-400" />
                        <span>{tr.rating} / 5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* 5-Factor Score Breakdown Progress Bars */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      5-Dimensional Match Breakdown
                    </span>

                    <div className="space-y-2 text-xs">
                      {/* Subject Match */}
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-0.5">
                          <span>Subject Match</span>
                          <span className="text-cyan-800">{tr.scores.subjectMatch}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-cyan-600 h-full rounded-full" style={{ width: `${tr.scores.subjectMatch}%` }} />
                        </div>
                      </div>

                      {/* Competency Match */}
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-0.5">
                          <span>Competency Match</span>
                          <span className="text-blue-800">{tr.scores.competencyMatch}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${tr.scores.competencyMatch}%` }} />
                        </div>
                      </div>

                      {/* Qualification Match */}
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-0.5">
                          <span>Qualification Match ({tr.highestDegree})</span>
                          <span className="text-indigo-800">{tr.scores.qualificationMatch}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${tr.scores.qualificationMatch}%` }} />
                        </div>
                      </div>

                      {/* Experience Match */}
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-0.5">
                          <span>Experience Match ({tr.expYears} yrs)</span>
                          <span className="text-purple-800">{tr.scores.experienceMatch}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${tr.scores.experienceMatch}%` }} />
                        </div>
                      </div>

                      {/* Performance Index */}
                      <div>
                        <div className="flex justify-between font-bold text-slate-700 text-[11px] mb-0.5">
                          <span>Performance Index</span>
                          <span className="text-emerald-800">{tr.scores.performanceMatch}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${tr.scores.performanceMatch}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Reasons */}
                  <div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(tr.id)}
                      className="text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-1"
                    >
                      {expandedReasons[tr.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedReasons[tr.id] ? "Hide Matching Reasons" : "View Detailed Matching Reasons & Formula"}
                    </button>

                    {expandedReasons[tr.id] && (
                      <div className="mt-2.5 p-3.5 bg-cyan-50/70 border border-cyan-100 rounded-xl space-y-2 text-xs">
                        <span className="font-bold text-cyan-950 block">Audit Reasons:</span>
                        <ul className="space-y-1 text-slate-700">
                          {tr.matchingReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <CheckCircle2 size={12} className="text-cyan-700 shrink-0 mt-0.5" />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 border-t border-cyan-200 text-[11px] font-mono text-cyan-900">
                          <strong>Formula Calculation:</strong> {tr.calculationExplanation}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assign Action */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{tr.email}</span>
                  <button
                    onClick={() => handleAssignToProgram(tr)}
                    disabled={assigningId === tr.id}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    {assigningId === tr.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <UserCheck size={14} />
                    )}
                    {assigningId === tr.id ? "Assigning..." : "Assign to Program"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
