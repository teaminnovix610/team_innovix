import React, { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, CheckCircle2, Award, BookOpen, Bell } from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";

export default function AdminPublishingPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "ANNOUNCEMENT",
    content: "",
    category: "General",
    authorName: "Admin / MoES Cell",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/announcements");
      if (res.data?.data) {
        setAnnouncements(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/announcements", formData);
      if (res.data?.success) {
        toast.success("Published onto Homepage successfully");
        setShowModal(false);
        setFormData({ title: "", type: "ANNOUNCEMENT", content: "", category: "General", authorName: "Admin / MoES Cell" });
        fetchAnnouncements();
      }
    } catch (err) {
      toast.error("Failed to publish content");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      toast.success("Removed item from homepage");
      fetchAnnouncements();
    } catch (err) {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-cyan-700" size={26} />
            Homepage Announcements & Content Publishing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish notifications, announcements, organizational achievements, and featured learning content onto the portal homepage.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={16} /> Publish New Entry
        </button>
      </div>

      {/* List of Published items */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading published feed...</div>
        ) : announcements.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No items published yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((item) => (
              <div key={item._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.type === "ACHIEVEMENT" ? "bg-amber-100 text-amber-800" :
                      item.type === "FEATURED_CONTENT" ? "bg-cyan-100 text-cyan-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {item.type?.replace("_", " ")}
                    </span>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {item.authorName}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Publish New Entry to Homepage</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              <div>
                <label className="block mb-1 font-bold">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., National Oceanography Workshop 2026"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Entry Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                >
                  <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                  <option value="ACHIEVEMENT">ACHIEVEMENT</option>
                  <option value="FEATURED_CONTENT">FEATURED CONTENT</option>
                  <option value="NOTIFICATION">NOTIFICATION</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-bold">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Training / Milestone / Research"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold">Detailed Content Description</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Provide complete announcement details or achievement overview..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
