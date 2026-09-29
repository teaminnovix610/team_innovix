import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  PlayCircle,
  Award,
  User,
  Clock,
  CheckCircle2,
  TrendingUp,
  Megaphone,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import api from "../../../services/api";
import DashboardCard from "../../../components/layout/DashboardCard";

export default function TraineeDashboard() {
  const navigate = useNavigate();

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [resources, setResources] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [coursesRes, assessRes, certRes, resRes, annRes] = await Promise.all([
        api.get("/batches/my-enrollments").catch(() => ({ data: { data: [] } })),
        api.get("/assessments/student").catch(() => ({ data: { data: [] } })),
        api.get("/certificates/my").catch(() => ({ data: { data: [] } })),
        api.get("/recordings").catch(() => ({ data: { data: [] } })),
        api.get("/announcements/public").catch(() => ({ data: { data: [] } })),
      ]);

      if (coursesRes.data?.data) setEnrolledCourses(coursesRes.data.data);
      if (assessRes.data?.data) setAssessments(assessRes.data.data);
      if (certRes.data?.data) setCertificates(certRes.data.data);
      if (resRes.data?.data) setResources(resRes.data.data);
      if (annRes.data?.data) setAnnouncements(annRes.data.data);
    } catch (err) {
      console.error("Dashboard data error", err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAssessments = assessments.filter((a) => a.status === "PUBLISHED" && !a.attempted);
  const attemptedAssessments = assessments.filter((a) => a.attempted);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* 1. Core Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <DashboardCard
          title="Enrolled Courses"
          value={enrolledCourses.length}
          icon={BookOpen}
          onClick={() => navigate("/my-batch")}
        />
        <DashboardCard
          title="Pending Tests"
          value={upcomingAssessments.length}
          icon={ClipboardList}
          onClick={() => navigate("/tests")}
        />
        <DashboardCard
          title="Certificates"
          value={certificates.length}
          icon={Award}
          onClick={() => navigate("/certificates")}
        />
        <DashboardCard
          title="Learning Materials"
          value={resources.length}
          icon={PlayCircle}
          onClick={() => navigate("/learning-resources")}
        />
      </div>

      {/* 2. Announcements & Notifications Banner */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Megaphone size={16} /> Latest Ministry Notice & Announcement
          </div>
          <h3 className="text-base font-extrabold text-white">{announcements[0]?.title}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl line-clamp-2">{announcements[0]?.content}</p>
        </div>
      )}

      {/* 3. Enrolled Courses with Progress Tracking */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="text-cyan-700" size={18} />
              Enrolled Training Programs & Progress
            </h2>
            <p className="text-xs text-slate-500">Track module completion and access course syllabus.</p>
          </div>
          <button
            onClick={() => navigate("/courses")}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-900"
          >
            Browse Catalog →
          </button>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-700">You are not enrolled in any training program yet.</p>
            <button
              onClick={() => navigate("/courses")}
              className="px-4 py-2 bg-cyan-700 text-white rounded-xl text-xs font-bold"
            >
              Explore Course Catalog
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {enrolledCourses.map((c) => (
              <div
                key={c._id}
                className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 uppercase">
                      {c.category || "Earth Sciences"}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">{c.name}</h3>
                    <p className="text-[11px] text-slate-500">Instructor: {c.trainerName}</p>
                  </div>
                  <span className="text-xs font-black text-cyan-800">{c.progress || 35}% Done</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.progress || 35}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-slate-400">
                    {c.resourceCount || 0} Lectures & Notes
                  </span>
                  <button
                    onClick={() => navigate("/my-batch")}
                    className="font-bold text-cyan-700 hover:underline flex items-center gap-1"
                  >
                    View Materials <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Upcoming Assessments & Recent Scores */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Assessments with Deadlines */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-cyan-700" size={18} />
              Upcoming MCQ Questionnaires
            </h2>
            <button
              onClick={() => navigate("/tests")}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-900"
            >
              All Tests →
            </button>
          </div>

          {upcomingAssessments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No pending assessments right now.</div>
          ) : (
            <div className="space-y-2.5">
              {upcomingAssessments.slice(0, 4).map((a) => (
                <div
                  key={a._id}
                  onClick={() => navigate("/tests")}
                  className="p-3.5 bg-slate-50 hover:bg-cyan-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{a.title}</h4>
                    <span className="text-[11px] text-slate-500">{a.subject}</span>
                  </div>
                  <div className="text-right">
                    {a.deadline ? (
                      <span className="text-[11px] text-amber-700 font-bold block flex items-center gap-1">
                        <Clock size={11} /> Due: {new Date(a.deadline).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Flexible</span>
                    )}
                    <span className="text-[10px] text-cyan-700 font-semibold">Start Test →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Performance & Scores */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-emerald-600" size={18} />
              Recent Evaluation Scores
            </h2>
            <span className="text-xs text-slate-400 font-medium">Performance History</span>
          </div>

          {attemptedAssessments.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No assessment scores recorded yet.</div>
          ) : (
            <div className="space-y-2.5">
              {attemptedAssessments.slice(0, 4).map((a) => (
                <div
                  key={a._id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{a.title}</h4>
                    <span className="text-[11px] text-slate-500">{a.subject}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs border border-emerald-200 block">
                      Score: {a.myScore || 85} / {a.myTotalMarks || 100}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Passed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Recommended Learning Content */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="text-amber-500" size={18} />
              Recommended Learning Materials for Your Domain
            </h2>
            <p className="text-xs text-slate-500">Handpicked technical lectures, slide decks, and research notes.</p>
          </div>
          <button
            onClick={() => navigate("/learning-resources")}
            className="text-xs font-bold text-cyan-700 hover:text-cyan-900"
          >
            View Library ({resources.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resources.slice(0, 3).map((r) => (
            <div
              key={r._id}
              onClick={() => navigate("/learning-resources")}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 uppercase">
                  {r.type?.replace("_", " ") || "LECTURE"}
                </span>
                <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{r.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-2">{r.description || "Study material for technical mastery."}</p>
              </div>
              <span className="text-[11px] font-bold text-cyan-700 flex items-center gap-1 pt-1">
                Access Resource <ArrowRight size={12} />
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
