import { Menu } from "lucide-react";

import ProfileDropdown from "./ProfileDropdown";

export default function Navbar({ toggleSidebar }) {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          className="lg:hidden p-2 -ml-2 rounded-md hover:bg-slate-100"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>

        <img
          src="/dashboardLogo.webp"
          alt="LearnIndiaLive"
          className="w-40 h-auto sm:hidden"
        />

        <h2 className="hidden sm:block font-semibold text-lg sm:text-xl truncate">
          Dashboard
        </h2>
      </div>

      <ProfileDropdown />
    </header>
  );
}