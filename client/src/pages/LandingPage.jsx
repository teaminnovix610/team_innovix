import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  LogIn,
  UserPlus,
  Award,
  BookOpen,
  Users,
  Megaphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Star,
  Building2,
} from "lucide-react";
import api from "../services/api";

export default function LandingPage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);

  useEffect(() => {
    fetchPublicAnnouncements();
  }, []);

  const fetchPublicAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await api.get("/announcements/public");
      if (res.data?.data) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load public announcements", err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Govt / Org Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-[11px] py-1.5 px-4 sm:px-8 flex justify-between items-center text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-bold text-cyan-400 uppercase tracking-wider">Ministry of Earth Sciences (MoES)</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Ministry of Education's Innovation Cell (MIC)</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Problem Statement: SIH26075</span>
          <span className="hidden md:inline">Sarim Moin Initiative</span>
        </div>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20">
            <Compass size={24} className="animate-spin-slow text-cyan-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white">
                CAPACITY<span className="text-cyan-400">CONNECT</span>
              </span>
              <span className="bg-cyan-950 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-800/50">
                MoES Portal
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Digital Capacity Building & LMS Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900 transition-colors flex items-center gap-1.5"
          >
            <LogIn size={15} /> Login
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
          >
            <UserPlus size={15} /> Register Account
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck size={14} className="text-cyan-400" /> Centralized Web Platform for Organizational Training & Skill Development
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Empowering Earth System Sciences Through <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">Digital Capacity Building</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Centralized portal supporting Trainees, Trainers, and Admins across MoES institutions with competency mapping, questionnaire assessments, trainer libraries, and live performance analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
            >
              Get Started as Trainee / Trainer <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 font-bold text-sm transition-all"
            >
              Portal Login
            </button>
          </div>
        </div>
      </section>

      {/* Impact Numbers Section */}
      <section className="px-4 sm:px-8 py-10 border-y border-slate-900 bg-slate-950/50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-cyan-400">5,000+</div>
            <div className="text-xs text-slate-400 font-medium">Trainees Enrolled</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-blue-400">120+</div>
            <div className="text-xs text-slate-400 font-medium">Expert Trainers</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-indigo-400">45+</div>
            <div className="text-xs text-slate-400 font-medium">Capacity Building Modules</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-emerald-400">98%</div>
            <div className="text-xs text-slate-400 font-medium">Competency Rating</div>
          </div>
        </div>
      </section>

      {/* Published Announcements & Achievements Feed */}
      <section className="px-4 sm:px-8 py-16 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
              <Megaphone size={16} /> Live Portal Updates
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Announcements, Achievements & Featured Modules
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {announcements.map((item, idx) => (
            <div
              key={item._id || idx}
              className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    item.type === "ACHIEVEMENT" ? "bg-amber-950 text-amber-300 border border-amber-800/40" :
                    item.type === "FEATURED_CONTENT" ? "bg-cyan-950 text-cyan-300 border border-cyan-800/40" :
                    "bg-blue-950 text-blue-300 border border-blue-800/40"
                  }`}>
                    {item.type?.replace("_", " ") || "ANNOUNCEMENT"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-white text-base leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.content}</p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-500">
                <span>By: {item.authorName || "MoES Cell"}</span>
                <span className="text-cyan-400 font-semibold flex items-center gap-1">
                  Read <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Platform Modules */}
      <section className="px-4 sm:px-8 py-16 bg-slate-900/40 border-t border-slate-900">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Three-Tiered Role Ecosystem</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed for Trainees, Subject Trainers, and Organizational Admins to drive end-to-end competency development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 text-cyan-400 flex items-center justify-center border border-cyan-800/50">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Trainee Module</h3>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  Professional Profile with qualifications, experience, & certificates
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  1-Click Course Enrollment & Resource Library Access
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  Subject-Wise MCQ Assessments with timed score evaluation
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                  Course & Content Rating and Feedback Submission
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center border border-blue-800/50">
                <Award size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Trainer Module</h3>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  Trainer Profile & Competency Matrix Registration
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  Questionnaire Authoring with deadlines & custom scoring
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  Trainer Library for recorded lectures & PPT materials
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-blue-400 shrink-0 mt-0.5" />
                  Real-time Trainee Participation & Performance Analytics
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center border border-indigo-800/50">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Admin Module</h3>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  User Approval Queue & Role Management Controls
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  Competency Mapping Engine for Trainer Assignment
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  Homepage Announcements & Content Publishing
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                  Dashboards for Courses, Enrollments, & Certifications
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 px-4 sm:px-8 text-slate-500 text-xs text-center space-y-2">
        <p className="font-bold text-slate-400">
          CAPACITY CONNECT — Digital Capacity Building and Learning Management Portal
        </p>
        <p>Problem Creator: Sarim Moin | Ministry of Earth Sciences (MoES) / MIC | Problem SIH26075</p>
        <p className="text-[11px] text-slate-600">© 2026 Ministry of Earth Sciences. All Rights Reserved.</p>
      </footer>
    </div>
  );
}