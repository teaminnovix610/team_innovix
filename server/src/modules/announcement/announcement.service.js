import Announcement from "../../models/Announcement.model.js";

class AnnouncementService {
  async getPublicAnnouncements() {
    let announcements = await Announcement.find({ isPublished: true }).sort({ createdAt: -1 }).limit(20);
    if (!announcements || announcements.length === 0) {
      // Return default initial announcements for CAPACITY CONNECT
      announcements = [
        {
          _id: "default-1",
          title: "MoES Capacity Building Workshop 2026 Announced",
          type: "ANNOUNCEMENT",
          content: "Ministry of Earth Sciences announces registration open for National Climate Modeling & Ocean Analytics Training.",
          category: "Training",
          authorName: "Sarim Moin (MoES Cell)",
          createdAt: new Date(),
        },
        {
          _id: "default-2",
          title: "Over 5,000 Earth Science Professionals Trained",
          type: "ACHIEVEMENT",
          content: "CAPACITY CONNECT reaches milestone of empowering 5,000 trainees across 45 national research institutions.",
          category: "Milestone",
          authorName: "Ministry of Education's Innovation Cell (MIC)",
          createdAt: new Date(Date.now() - 86400000),
        },
        {
          _id: "default-3",
          title: "New Module: Deep-Sea Exploration & Sensor Networks",
          type: "FEATURED_CONTENT",
          content: "Explore newly uploaded video lectures, interactive slide decks, and MCQ assessments.",
          category: "New Resource",
          authorName: "MoES Content Hub",
          createdAt: new Date(Date.now() - 172800000),
        },
      ];
    }
    return announcements;
  }

  async getAllAnnouncements() {
    return await Announcement.find().sort({ createdAt: -1 });
  }

  async createAnnouncement(data) {
    return await Announcement.create(data);
  }

  async updateAnnouncement(id, data) {
    return await Announcement.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteAnnouncement(id) {
    return await Announcement.findByIdAndDelete(id);
  }
}

export default new AnnouncementService();
