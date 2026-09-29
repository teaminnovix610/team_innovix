import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Search, Filter, CheckCircle2, Clock, Users, ArrowRight, Sparkles, Building, Layers } from "lucide-react";
import api from "../../../services/api";
import useAuth from "../../../hooks/useAuth";
import { toast } from "sonner";
import LoadingState from "@/components/layout/LoadingState";

const CATEGORIES = [
  "ALL",
  "Earth Sciences",
  "Oceanography",
  "Meteorology",
  "Climate Science",
  "Geophysics",
  "Remote Sensing",
  "AI & Data Science",
];

export default function CourseCatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTrainee = user?.role === "TRAINEE" || user?.role === "STUDENT";

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get("/batches/catalog");
      if (res.data?.data) {
        setCourses(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load course catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (batchId) => {
    setEnrollingId(batchId);
    try {
      const res = await api.post(`/batches/${batchId}/enroll`);
      if (res.data?.success) {
        toast.success("Successfully enrolled in capacity building course!");
        fetchCatalog();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrollingId(null);
    }
  };

  const filtered = courses.filter((c) => {
    const matchesCat = selectedCategory === "ALL" || c.category === selectedCategory;
    const matchesSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()) ||
      c.trainerName?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return <LoadingState message="Loading available capacity building courses..." />;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} /> Ministry of Earth Sciences Training Catalog
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Capacity Building Courses & Training Programs
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Browse structured learning modules in Oceanography, Meteorology, Geophysics, Satellite Remote Sensing, and AI. Enroll to access specialized lectures, slide decks, and MCQ assessments.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 w-full md:w-96">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, or trainer..."
            className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors ${
                selectedCategory === cat
                  ? "bg-cyan-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Course Cards Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <BookOpen size={42} className="mx-auto text-slate-300" />
          <p className="text-base font-bold text-slate-700">No courses found</p>
          <p className="text-xs text-slate-400">Try adjusting your search terms or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                    {course.category || "Earth Sciences"}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock size={12} /> {course.durationHours || 30}h Duration
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">{course.name}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5">
                    {course.description || "In-depth technical training module supporting organizational capacity development."}
                  </p>
                </div>

                {/* Trainer Info */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Instructor</span>
                    <span className="font-bold text-slate-800">{course.trainerName}</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[200px]">
                      {course.trainerOrg}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Enrollment</span>
                    <span className="font-bold text-cyan-800 flex items-center gap-1 justify-end">
                      <Users size={12} /> {course.enrolledCount} / {course.capacity}
                    </span>
                  </div>
                </div>

                {/* Syllabus Highlights */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1.5">
                    <Layers size={13} className="text-cyan-600" /> Syllabus Highlights
                  </span>
                  <div className="space-y-1">
                    {(course.syllabus || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">
                  {course.resourceCount || 0} Materials · {course.assessmentCount || 0} Tests
                </span>

                {course.isEnrolled ? (
                  <button
                    onClick={() => navigate("/my-batch")}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Enrolled (View)
                  </button>
                ) : isTrainee ? (
                  <button
                    onClick={() => handleEnroll(course._id)}
                    disabled={enrollingId === course._id}
                    className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    {enrollingId === course._id ? "Enrolling..." : "Enroll Now"} <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/batches/${course._id}`)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
