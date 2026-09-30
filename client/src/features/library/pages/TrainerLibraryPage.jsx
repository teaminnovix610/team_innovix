import { useState, useEffect } from "react";
import { FolderGit2, Upload, Trash2, ExternalLink, CheckCircle2 } from "lucide-react";
import api from "../../../services/api";
import { toast } from "sonner";
import { getMediaActionLabel, getMediaUrl } from "@/lib/media";

export default function TrainerLibraryPage() {
  const [recordings, setRecordings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    batchId: "",
    subject: "",
    topic: "",
    title: "",
    description: "",
    videoUrl: "",
    type: "RECORDED_LECTURE",
  });

  useEffect(() => {
    fetchLibrary();
    fetchCourses();
  }, []);

  async function fetchLibrary() {
    setLoading(true);
    try {
      const res = await api.get("/recordings");
      if (res.data?.data) {
        setRecordings(res.data.data);
      }
    } catch {
      toast.error("Failed to load trainer library");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const res = await api.get("/batches/my");
      if (res.data?.data) {
        const fetchedCourses = res.data.data;
        setCourses(fetchedCourses);
        if (fetchedCourses.length > 0) {
          setFormData((prev) => ({
            ...prev,
            batchId: fetchedCourses[0]._id,
            subject: fetchedCourses[0].name || fetchedCourses[0].classLevel || "General",
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            batchId: "",
            subject: "",
          }));
        }
      }
    } catch {
      toast.error("Failed to load assigned courses");
    }
  }

  const handleCategoryChange = (val) => {
    const selectedCourse = courses.find((course) => course._id === val);
    if (!selectedCourse) return;
    setFormData((prev) => ({
      ...prev,
      batchId: selectedCourse._id,
      subject: selectedCourse.name || selectedCourse.classLevel || selectedCourse.category || "General",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Security validation on URLs
    if (formData.videoUrl) {
      try {
        const parsed = new URL(formData.videoUrl);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          toast.error("Resource URL must use a secure protocol (https://)");
          return;
        }
      } catch {
        toast.error("Please enter a valid URL (e.g. Google Drive, YouTube, or Cloudinary link)");
        return;
      }
    }

    const payload = {
      ...formData,
      batchId: formData.batchId,
      subject: formData.subject?.trim() || "General",
    };

    try {
      const res = await api.post("/recordings", payload);
      if (res.data?.success) {
        toast.success("Resource uploaded and published to enrolled trainees!");
        setShowModal(false);
        setFormData({
          batchId: courses[0]?._id || "",
          subject: courses[0]?.name || courses[0]?.classLevel || "",
          topic: "",
          title: "",
          description: "",
          videoUrl: "",
          type: "RECORDED_LECTURE",
        });
        fetchLibrary();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload resource");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/recordings/${id}`);
      toast.success("Resource removed from library");
      fetchLibrary();
    } catch {
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="text-cyan-700" size={28} />
            Trainer Resource Library & Curriculum Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload recorded lectures, slide presentations (PPT/PDF), and study materials categorized by Course and Subject/Topic for enrolled trainees.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={courses.length === 0}
          title={courses.length === 0 ? "Ask an administrator to assign a course first" : "Upload course material"}
          className="px-5 py-3 bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Upload size={16} /> {courses.length === 0 ? "No Assigned Courses" : "Upload New Material"}
        </button>
      </div>

      {/* Resource Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading library materials...</div>
        ) : recordings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs space-y-2">
            <FolderGit2 size={40} className="mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">Trainer Library is Empty</p>
            <p className="text-slate-400">Click 'Upload New Material' to publish lectures, slides, and study notes.</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recordings.map((rec) => {
              const materialUrl = getMediaUrl(rec);
              const cardContent = (
                <>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 uppercase tracking-wider">
                    {rec.type?.replaceAll("_", " ") || "RECORDED LECTURE"}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug mt-3">{rec.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-2">{rec.description || "Capacity building technical study file."}</p>
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {rec.subject && <span className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg font-medium">Subject: {rec.subject}</span>}
                    {rec.topic && <span className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-lg font-medium">Topic: {rec.topic}</span>}
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Available to Trainees
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold ${materialUrl ? "text-cyan-700 group-hover:text-cyan-900" : "text-slate-400"}`}>
                      {materialUrl ? <><ExternalLink size={13} /> {getMediaActionLabel(rec)}</> : "Material link unavailable"}
                    </span>
                  </div>
                </>
              );

              return (
                <article key={rec._id} className="relative bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  {materialUrl ? (
                    <a
                      href={materialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${getMediaActionLabel(rec)}: ${rec.title}`}
                      className="group block p-6 rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-700 hover:bg-slate-50 cursor-pointer"
                    >
                      {cardContent}
                    </a>
                  ) : <div className="p-6">{cardContent}</div>}
                  <button
                    onClick={() => handleDelete(rec._id)}
                    className="absolute top-4 right-4 z-10 text-slate-400 hover:text-rose-600 p-1 rounded transition-colors bg-white/90"
                    title="Delete Material"
                    aria-label={`Delete ${rec.title}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Step Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Upload to Trainer Library</h2>
              <p className="text-xs text-slate-500">
                Follow the workflow: Select Course → Subject/Topic → Upload Resource → Publish.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium text-slate-700">
              {/* Step 1: Select Subject / Material Category */}
              <div>
                <label className="block mb-1 font-bold text-slate-800">
                  1. Subject / Material Category *
                </label>
                <select
                  required
                  disabled={courses.length === 0}
                  value={formData.batchId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600 bg-white font-medium"
                >
                  <option value="" disabled>-- Select Subject / Category --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.classLevel || c.category || "Assigned Subject"})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Materials are attached to the selected course and become available to enrolled trainees.
                </p>
              </div>

              {/* Step 2: Subject & Topic */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-800">2. Subject Domain *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Oceanography"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-800">Topic / Unit</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g. Coastal Wave Radar"
                    className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              {/* Step 3: Title */}
              <div>
                <label className="block mb-1 font-bold text-slate-800">3. Resource Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Radar Sensor Calibration Lecture Deck"
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              {/* Format */}
              <div>
                <label className="block mb-1 font-bold text-slate-800">Resource Format</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600 bg-white"
                >
                  <option value="RECORDED_LECTURE">Recorded Lecture Video</option>
                  <option value="PRESENTATION">Slide Presentation (PPT / PDF)</option>
                  <option value="STUDY_MATERIAL">Study Material & Reference Guide</option>
                </select>
              </div>

              {/* Step 4: URL */}
              <div>
                <label className="block mb-1 font-bold text-slate-800">Resource URL / Media Link (HTTPS) *</label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600 font-mono text-slate-800"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Securely supports Cloudinary, Google Drive, YouTube, and Institutional cloud links.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-bold text-slate-800">Description & Prerequisites</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of learning outcomes, key formulas, and lecture takeaways..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl font-bold shadow-md"
                >
                  Upload & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
