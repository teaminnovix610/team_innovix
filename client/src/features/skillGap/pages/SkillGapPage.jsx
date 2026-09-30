import React, { useState, useEffect } from "react";
import {
  Target,
  TrendingUp,
  CheckCircle,
  BookOpen,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";

const SEVERITY_META = {
  CRITICAL: {
    color: "bg-red-100 text-red-700 border-red-200",
    bar: "bg-red-500",
    label: "Critical Gap",
  },
  MODERATE: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    bar: "bg-amber-400",
    label: "Moderate Gap",
  },
  LOW: {
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    bar: "bg-yellow-400",
    label: "Low Gap",
  },
  NONE: {
    color: "bg-green-100 text-green-700 border-green-200",
    bar: "bg-green-500",
    label: "On Track",
  },
};

export default function SkillGapPage() {
  const [gaps, setGaps] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);
  const [tab, setTab] = useState("gaps");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gapRes, roadmapRes] = await Promise.all([
        api.get("/skill-gap/my-gaps"),
        api.get("/skill-gap/my-roadmap"),
      ]);
      setGaps(gapRes.data?.data || []);
      setRoadmap(roadmapRes.data?.data || null);
    } catch {
      // No gaps yet is fine — silently ignore
    } finally {
      setLoading(false);
    }
  };

  const recompute = async () => {
    setRecomputing(true);
    try {
      await api.post("/skill-gap/recompute");
      toast.success("Skill gap analysis updated!");
      await fetchData();
    } catch {
      toast.error("Failed to recompute");
    } finally {
      setRecomputing(false);
    }
  };

  const completeStep = async (order) => {
    try {
      await api.post("/skill-gap/complete-step", { stepOrder: order });
      toast.success("Step marked complete!");
      await fetchData();
    } catch {
      toast.error("Failed to update step");
    }
  };

  const completedSteps = roadmap?.steps?.filter((s) => s.isCompleted).length || 0;
  const totalSteps = roadmap?.steps?.length || 0;
  const roadmapProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Target className="text-blue-600" size={26} />
            My Skill Gap &amp; Learning Roadmap
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Analysis based on your assessment performance. Complete steps to close skill gaps.
          </p>
        </div>
        <button
          onClick={recompute}
          disabled={recomputing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:opacity-60 transition-colors"
        >
          <RefreshCw size={14} className={recomputing ? "animate-spin" : ""} />
          {recomputing ? "Analysing..." : "Refresh Analysis"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {["gaps", "roadmap"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
              tab === t
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t === "gaps" ? "Skill Gaps" : "Learning Roadmap"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-500 text-sm">Loading analysis...</div>
      ) : tab === "gaps" ? (
        /* ── Skill Gaps Tab ─────────────────────────────────────── */
        <div className="space-y-4">
          {gaps.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
              <AlertTriangle className="mx-auto mb-3 text-amber-400" size={32} />
              <p className="text-slate-600 font-semibold">No skill gap data yet.</p>
              <p className="text-slate-400 text-xs mt-1">
                Complete some assessments first, then click Refresh Analysis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gaps.map((gap) => {
                const meta = SEVERITY_META[gap.gapSeverity] || SEVERITY_META.NONE;
                return (
                  <div
                    key={gap._id}
                    className={`bg-white rounded-2xl border p-5 shadow-sm ${meta.color}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-base">{gap.subject}</h3>
                        {gap.topic && (
                          <p className="text-xs opacity-70">{gap.topic}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Current Score</span>
                        <span>{gap.currentScore}%</span>
                      </div>
                      <div className="w-full bg-white/60 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${meta.bar}`}
                          style={{ width: `${Math.min(gap.currentScore, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs opacity-60">
                        <span>0%</span>
                        <span>Target: {gap.targetScore || 70}%</span>
                      </div>
                    </div>

                    <p className="text-xs opacity-70">
                      {gap.attemptsCount} attempt(s) analysed
                    </p>

                    {gap.recommendedResources?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-current/20 space-y-1">
                        <p className="text-xs font-bold mb-1">Recommended Resources:</p>
                        {gap.recommendedResources.slice(0, 2).map((r, i) => (
                          <a
                            key={i}
                            href={r.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs underline hover:no-underline"
                          >
                            <BookOpen size={11} /> {r.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Roadmap Tab ─────────────────────────────────────────── */
        <div className="space-y-4">
          {!roadmap ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200">
              <TrendingUp className="mx-auto mb-3 text-blue-400" size={32} />
              <p className="text-slate-600 font-semibold">No roadmap generated yet.</p>
              <p className="text-slate-400 text-xs mt-1">
                Complete assessments and click Refresh Analysis to generate your personalized roadmap.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-slate-900">Overall Progress</h2>
                  <span className="text-sm font-bold text-blue-600">{roadmapProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {completedSteps} of {totalSteps} steps completed
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {roadmap.steps.map((step) => (
                  <div
                    key={step.order}
                    className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4 ${
                      step.isCompleted ? "opacity-60" : ""
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        step.isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {step.isCompleted ? <CheckCircle size={16} /> : step.order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            step.type === "ASSESSMENT"
                              ? "bg-purple-100 text-purple-700"
                              : step.type === "RESOURCE"
                              ? "bg-cyan-100 text-cyan-700"
                              : step.type === "LIVE_CLASS"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {step.type}
                        </span>
                        {step.subject && (
                          <span className="text-[10px] text-slate-400">{step.subject}</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
                      {step.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                      )}
                      {step.referenceUrl && (
                        <a
                          href={step.referenceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 underline mt-1 inline-block"
                        >
                          Open Resource
                        </a>
                      )}
                    </div>

                    {!step.isCompleted && (
                      <button
                        onClick={() => completeStep(step.order)}
                        className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl border border-green-200 transition-colors"
                      >
                        <CheckCircle size={13} /> Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
