import React from "react";
import { BarChart2, BookOpen, ClipboardList, Flag, LayoutDashboard, LogOut, ShieldCheck, Sparkles, Tags, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { madalLogo } from "../lib/apiClient";

const Sidebar = () => {
  const { user, logout, isAdmin, isModerator, isOwner } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isModerator) return null;

  const linkClasses = (path) =>
    `flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-bold transition ${
      location.pathname === path ? "bg-orange-600 text-white" : "text-orange-50 hover:bg-white/10"
    }`;

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-gray-950 p-4 text-white md:flex">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <img src={madalLogo} alt="Madal" className="h-11 w-11 rounded-lg object-cover" />
        <div>
          <p className="text-sm text-orange-200">Madal Admin</p>
          <h1 className="truncate text-xl font-black">{user?.username}</h1>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-2">
        <Link to="/admin-dashboard" className={linkClasses("/admin-dashboard")}>
          <LayoutDashboard size={18} />
          Dashboard
        </Link>
        {isAdmin && (
          <>
            <Link to="/admin/users" className={linkClasses("/admin/users")}>
              <Users size={18} />
              Users
            </Link>
          </>
        )}
        <Link to="/viewbook" className={linkClasses("/viewbook")}>
          <BookOpen size={18} />
          Stories
        </Link>
        <Link to="/admin/reports" className={linkClasses("/admin/reports")}>
          <Flag size={18} />
          Reports
        </Link>
        {isAdmin && (
          <>
            <Link to="/admin/featured" className={linkClasses("/admin/featured")}>
              <Sparkles size={18} />
              Featured
            </Link>
            <Link to="/admin/verification" className={linkClasses("/admin/verification")}>
              <ShieldCheck size={18} />
              Verification
            </Link>
            {isOwner && (
              <Link to="/admin/logs" className={linkClasses("/admin/logs")}>
                <ClipboardList size={18} />
                Moderation Log
              </Link>
            )}
            <Link to="/admin/genres" className={linkClasses("/admin/genres")}>
              <Tags size={18} />
              Genres
            </Link>
          </>
        )}
        <Link to="/Books" className={linkClasses("/Books")}>
          <BarChart2 size={18} />
          Public Site
        </Link>
      </nav>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-bold text-orange-50 hover:bg-red-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
