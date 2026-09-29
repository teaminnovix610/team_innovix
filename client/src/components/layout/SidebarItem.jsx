import { NavLink } from "react-router-dom";

export default function SidebarItem({ to, icon: Icon, title, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-3 rounded-lg transition-colors
        ${isActive ? "bg-blue-600 text-white" : "hover:bg-slate-100"}`
      }
    >
      <Icon size={20} />
      <span className="truncate">{title}</span>
    </NavLink>
  );
}