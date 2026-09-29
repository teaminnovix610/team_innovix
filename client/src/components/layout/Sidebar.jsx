import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  User,
  Settings,
  X,
  ClipboardList,
  Compass,
  Megaphone,
  FolderGit2,
  Award,
  ShieldCheck,
  Layers,
} from "lucide-react";

import Logo from "./Logo";
import SidebarItem from "./SidebarItem";

import useAuth from "../../hooks/useAuth";

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === "ADMIN";
  const isTrainer = role === "TRAINER" || role === "TEACHER";
  const isTrainee = role === "TRAINEE" || role === "STUDENT";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 h-screen border-r bg-white flex flex-col justify-between
          transform transition-transform duration-200 ease-in-out
          lg:sticky lg:top-0 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div>
          <div className="flex items-center justify-between lg:block">
            <Logo />

            <button
              className="lg:hidden mr-4 p-2 rounded-md hover:bg-slate-100"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} title="Dashboard" onClick={onClose} />

            {/* Competency Mapping (Accessible to all roles) */}
            <SidebarItem to="/competency-mapping" icon={Compass} title="Competency Mapping" onClick={onClose} />

            {isAdmin && (
              <>
                <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Admin Controls
                </div>
                <SidebarItem to="/admin/users" icon={ShieldCheck} title="User Approvals & Roles" onClick={onClose} />
                <SidebarItem to="/admin/publishing" icon={Megaphone} title="Homepage Publishing" onClick={onClose} />
                <SidebarItem to="/courses" icon={BookOpen} title="Training Programs & Catalog" onClick={onClose} />
                <SidebarItem to="/certificates" icon={Award} title="Certifications" onClick={onClose} />
                <SidebarItem to="/live-classes" icon={Video} title="Live Classrooms" onClick={onClose} />
              </>
            )}

            {isTrainer && (
              <>
                <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Trainer Hub
                </div>
                <SidebarItem to="/batches" icon={BookOpen} title="My Courses" onClick={onClose} />
                <SidebarItem to="/assessments" icon={ClipboardList} title="Questionnaires & MCQ" onClick={onClose} />
                <SidebarItem to="/trainer-library" icon={FolderGit2} title="Trainer Library" onClick={onClose} />
                <SidebarItem to="/certificates" icon={Award} title="Certifications" onClick={onClose} />
                <SidebarItem to="/live-classes" icon={Video} title="Live Sessions" onClick={onClose} />
              </>
            )}

            {isTrainee && (
              <>
                <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Trainee Portal
                </div>
                <SidebarItem to="/courses" icon={BookOpen} title="Browse Courses" onClick={onClose} />
                <SidebarItem to="/my-batch" icon={Layers} title="Enrolled Programs" onClick={onClose} />
                <SidebarItem to="/learning-resources" icon={FolderGit2} title="Learning Library" onClick={onClose} />
                <SidebarItem to="/tests" icon={ClipboardList} title="Subject Assessments" onClick={onClose} />
                <SidebarItem to="/certificates" icon={Award} title="My Certificates" onClick={onClose} />
              </>
            )}

            <div className="pt-3 pb-1 px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Account
            </div>
            <SidebarItem to="/profile" icon={User} title="Professional Profile" onClick={onClose} />
            <SidebarItem to="/settings" icon={Settings} title="Settings" onClick={onClose} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-700 text-white font-bold text-xs flex items-center justify-center">
              {user?.firstName?.[0] || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
              </span>
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-1.5 py-0.5 rounded w-max uppercase">
                {user?.role || "TRAINEE"}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}