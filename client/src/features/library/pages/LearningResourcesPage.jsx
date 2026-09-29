import React, { useState, useEffect } from "react";
import { FolderGit2, Search, ExternalLink, Star, MessageSquare } from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";

export default function LearningResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [feedbackModal, setFeedbackModal] = useState(null); // resource title
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await api.get("/recordings");
      if (res.data?.data) {
        setResources(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load learning resources");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/feedback", {
        courseTitle: feedbackModal,
        rating,
        comment,
        category: "RESOURCE",
      });
      if (res.data?.success) {
        toast.success("Thank you for your feedback!");
        setFeedbackModal(null);
        setComment("");
      }
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  const filtered = resources.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="text-cyan-700" size={26} />
            Learning Resources & Trainer Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access recorded lectures, presentation decks, study materials, and provide feedback on course content.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 min-w-[240px]">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter resources..."
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading resources...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No resources available matching search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((resItem) => (
              <div key={resItem._id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 uppercase">
                    {resItem.type || "LEARNING_RESOURCE"}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{resItem.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3">{resItem.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {resItem.videoUrl ? (
                    <a
                      href={resItem.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-900"
                    >
                      <ExternalLink size={14} /> View Material
                    </a>
                  ) : <span className="text-xs text-slate-400">Resource file</span>}

                  <button
                    onClick={() => setFeedbackModal(resItem.title)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <MessageSquare size={13} /> Feedback
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Provide Resource Feedback</h2>
            <p className="text-xs text-slate-500">{feedbackModal}</p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                        rating >= star ? "bg-amber-50 border-amber-300 text-amber-500 font-bold" : "border-slate-200 text-slate-400"
                      }`}
                    >
                      <Star size={18} className={rating >= star ? "fill-amber-400" : ""} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold">Feedback Comments</label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on clarity, usefulness, or areas for improvement..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackModal(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
