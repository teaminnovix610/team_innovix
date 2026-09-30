import React, { useState, useEffect } from "react";
import {
  Megaphone, Plus, Pencil, Trash2, Eye, EyeOff, X, CheckCircle, Award, Star
} from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "ANNOUNCEMENT", label: "Announcement", icon: Megaphone },
  { value: "ACHIEVEMENT", label: "Achievement", icon: Award },
  { value: "FEATURED_CONTENT", label: "Featured Content", icon: Star },
  { value: "NOTIFICATION", label: "Notification", icon: CheckCircle },
];

const TYPE_COLORS = {
  ANNOUNCEMENT: "bg-blue-100 text-blue-700",
  ACHIEVEMENT: "bg-amber-100 text-amber-700",
  FEATURED_CONTENT: "bg-purple-100 text-purple-700",
  NOTIFICATION: "bg-green-100 text-green-700",
};

const EMPTY_FORM = {
  title: "",
  content: "",
  type: "ANNOUNCEMENT",
  category: "",
  isPublished: true,
};

export default function AdminPublishingPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/announcements");
      setItems(res.data?.data || res.data?.announcements || []);
    } catch {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditItem(null);
    setModal("create");
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || "",
      content: item.content || "",
      type: item.type || "ANNOUNCEMENT",
      category: item.category || "",
      isPublished: item.isPublished !== false,
    });
    setEditItem(item);
    setModal("edit");
  };

  const closeModal = () => { setModal(null); setEditItem(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setSubmitting(true);
    try {
      if (modal === "edit" && editItem) {
        await api.put(`/announcements/${editItem._id}`, form);
        toast.success("Updated successfully");
      } else {
        await api.post("/announcements", form);
        toast.success("Published successfully");
      }
      closeModal();
      fetchItems();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/announcements/${item._id}`);
      toast.success("Deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = activeTab === "ALL" ? items : items.filter((i) => i.type === activeTab);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" size={26} />
            Admin Publishing Centre
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish announcements, achievements, notifications and featured content for trainees.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
        >
          <Plus size={16} /> New Publication
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {["ALL", ...TYPE_OPTIONS.map((t) => t.value)].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab === "ALL"
              ? `All (${items.length})`
              : `${TYPE_OPTIONS.find((t) => t.value === tab)?.label} (${items.filter((i) => i.type === tab).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-sm">
            No publications found. Click &quot;New Publication&quot; to create one.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Title
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.content}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        TYPE_COLORS[item.type] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                        item.isPublished !== false
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.isPublished !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                      {item.isPublished !== false ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {modal === "edit" ? "Edit Publication" : "New Publication"}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter title"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Content *</label>
                <textarea
                  required
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the announcement content here..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Category (optional)
                </label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Weather Science, Capacity Building"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="isPublished" className="font-semibold text-slate-700 text-sm">
                  Publish immediately (visible to all users)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Saving..." : modal === "edit" ? "Save Changes" : "Publish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
