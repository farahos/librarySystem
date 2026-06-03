import React, { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, ChevronDown, LayoutDashboard, Library, LogOut, Menu, PenLine, Settings, User, UserPlus, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { apiClient, madalLogo } from "../lib/apiClient";
import { notificationLink, notificationText } from "./NotificationsPage";
import { Avatar } from "./UserProfile";

const navLinks = [
  { to: "/Home", label: "Home" },
  { to: "/Books", label: "Stories" },
  { to: "/library", label: "Library" },
  { to: "/create", label: "Write" },
  { to: "/About", label: "About" },
  { to: "/Contact", label: "Contact" },
];

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);
  const bellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = () => {
    if (!user) return;
    apiClient
      .get("/notifications", { params: { limit: 8 } })
      .then(({ data }) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
  };

  useEffect(() => {
    setOpen(false);
    setUserMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    loadNotifications();
  }, [user, location.pathname]);

  useEffect(() => {
    const closeFloating = (event) => {
      if (menuRef.current?.contains(event.target) || bellRef.current?.contains(event.target)) return;
      setUserMenuOpen(false);
      setNotificationsOpen(false);
    };
    document.addEventListener("mousedown", closeFloating);
    return () => document.removeEventListener("mousedown", closeFloating);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const openNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    setUserMenuOpen(false);
    if (nextOpen) {
      loadNotifications();
      if (unreadCount > 0) {
        await apiClient.patch("/notifications/read").catch(() => {});
        setUnreadCount(0);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/Home" className="flex items-center gap-2 text-2xl font-black text-gray-950">
          <img src={madalLogo} alt="Madal" className="h-11 w-11 rounded-lg object-cover shadow-sm" />
          Madal
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                location.pathname === link.to ? "bg-orange-50 text-orange-700" : "text-gray-700 hover:bg-gray-50 hover:text-orange-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <div ref={bellRef} className="relative">
                <button onClick={openNotifications} className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-50" title="Notifications">
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-orange-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="font-black text-gray-950">Notifications</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 6).map((notification) => (
                        <Link key={notification._id} to={notificationLink(notification)} className="block border-b border-gray-100 px-4 py-3 hover:bg-orange-50">
                          <p className="text-sm font-bold text-gray-900">{notificationText(notification)}</p>
                          <p className="mt-1 text-xs font-semibold text-gray-500">{new Date(notification.createdAt).toLocaleString()}</p>
                        </Link>
                      ))}
                      {notifications.length === 0 && <p className="px-4 py-6 text-sm text-gray-500">No notifications yet.</p>}
                    </div>
                    <Link to="/notifications" className="block bg-gray-50 px-4 py-3 text-center text-sm font-black text-orange-700 hover:bg-orange-50">
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              <div ref={menuRef} className="relative">
                <button onClick={() => setUserMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-50">
                  <Avatar profile={user} />
                  <span className="text-sm font-semibold text-gray-600">{user.username}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                    <MenuLink to="/profile" icon={User} label="My Profile" />
                    <MenuLink to="/writer-dashboard" icon={LayoutDashboard} label="Writer Dashboard" />
                    <MenuLink to="/library" icon={Library} label="Library" />
                    <MenuLink to="/settings" icon={Settings} label="Settings" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50">
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50">
                Login
              </Link>
              <Link to="/Register" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 text-sm font-bold text-white hover:bg-orange-700">
                <UserPlus size={16} />
                Join
              </Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-orange-100 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to} className="rounded-lg px-3 py-2 font-bold text-gray-700">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="rounded-lg px-3 py-2 font-bold text-gray-700">My Profile</Link>
                <Link to="/notifications" className="rounded-lg px-3 py-2 font-bold text-gray-700">Notifications</Link>
                <Link to="/writer-dashboard" className="rounded-lg px-3 py-2 font-bold text-gray-700">Writer Dashboard</Link>
                <Link to="/settings" className="rounded-lg px-3 py-2 font-bold text-gray-700">Settings</Link>
                <button onClick={handleLogout} className="rounded-lg bg-gray-900 px-3 py-2 font-bold text-white">Logout</button>
              </>
            ) : (
              <Link to="/Register" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-3 py-2 font-bold text-white">
                <PenLine size={16} />
                Start writing
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

function MenuLink({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-700">
      <Icon size={17} />
      {label}
    </Link>
  );
}

export default Header;
