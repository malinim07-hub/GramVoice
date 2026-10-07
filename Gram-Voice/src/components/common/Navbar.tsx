import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  History,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Megaphone,
  FileText,
  Building2,
  Languages,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ==========================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ==========================================
  // CLOSE DROPDOWN WHEN ROUTE CHANGES
  // ==========================================

  useEffect(() => {
    setShowDropdown(false);
  }, [location.pathname]);

  // ==========================================
  // ACTIVE LINK
  // ==========================================

  const isActive = (path: string) => location.pathname === path;

  // ==========================================
  // MOBILE MENU
  // ==========================================

  const toggleMenu = () => {
    setIsOpen((current) => !current);
  };

  // ==========================================
  // ROLE CHECK
  // ==========================================

  const isGovernmentUser =
    user?.role === "admin" || user?.role === "officer";

  // ==========================================
  // NAVIGATION LINKS
  // ==========================================

  const navLinks = user
    ? isGovernmentUser
      ? [
          {
            path: "/gov",
            name: "Government Portal",
            icon: Building2,
          },
        ]
      : [
          {
            path: "/dashboard",
            name: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            path: "/report",
            name: "Report Issue",
            icon: FileText,
          },
          {
            path: "/translation",
            name: "AI Translator",
            icon: Languages,
          },
          {
            path: "/history",
            name: "My Reports",
            icon: History,
          },
        ]
    : [
        {
          path: "/",
          name: "Home",
          icon: Megaphone,
        },
        {
          path: "/report",
          name: "Report Issue",
          icon: FileText,
        },
        {
          path: "/translation",
          name: "AI Translator",
          icon: Languages,
        },
      ];

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    setShowDropdown(false);
    setIsOpen(false);

    logout();

    navigate("/login", { replace: true });
  };

  // ==========================================
  // LOGO DESTINATION
  // ==========================================

  const logoDestination = !user
    ? "/"
    : isGovernmentUser
    ? "/gov"
    : "/dashboard";

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] glass-panel-heavy border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ==========================================
            LOGO
        ========================================== */}

        <Link
          to={logoDestination}
          className="flex items-center gap-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition"
        >
          <Megaphone className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />

          <span className="tracking-tight text-glow">
            GramVoice
          </span>
        </Link>

        {/* ==========================================
            DESKTOP NAVIGATION
        ========================================== */}

        <div className="hidden md:flex items-center gap-6 text-slate-300">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition duration-200 hover:text-white ${
                  active
                    ? "bg-slate-800/50 text-cyan-400 border border-cyan-500/20"
                    : "hover:bg-slate-900/50 text-slate-400"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-cyan-400" : ""
                  }`}
                />

                {link.name}
              </Link>
            );
          })}
        </div>

        {/* ==========================================
            USER SECTION
        ========================================== */}

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div
              ref={dropdownRef}
              className="relative z-[110]"
            >

              {/* ==========================================
                  ADMIN / USER BUTTON
              ========================================== */}

              <button
                type="button"
                onClick={() => {
                  setShowDropdown((current) => !current);
                }}
                className="relative z-[120] flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-slate-600 transition cursor-pointer"
              >
                {/* Avatar */}

                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs shadow-md ${
                    isGovernmentUser
                      ? "bg-gradient-to-br from-indigo-500 to-blue-600"
                      : "bg-gradient-to-br from-cyan-500 to-purple-600"
                  }`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + Role */}

                <div className="flex flex-col items-start">
                  <span className="text-slate-300 text-sm font-medium">
                    {user.name}
                  </span>

                  <span
                    className={`text-[9px] uppercase tracking-wider font-bold ${
                      isGovernmentUser
                        ? "text-indigo-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                {/* Dropdown Arrow */}

                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* ==========================================
                  USER DROPDOWN
              ========================================== */}

              {showDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-[200]"
                  onMouseDown={(event) => event.stopPropagation()}
                >

                  {/* Profile */}

                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                  >
                    <User className="w-4 h-4" />

                    <span>My Profile / Settings</span>
                  </Link>

                  {/* Government Portal */}

                  {isGovernmentUser && (
                    <Link
                      to="/gov"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                    >
                      <Building2 className="w-4 h-4" />

                      <span>Government Portal</span>
                    </Link>
                  )}

                  {/* Divider */}

                  <div className="my-1 border-t border-slate-800" />

                  {/* Logout */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />

                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">

              {/* Sign In */}

              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition"
              >
                Sign In
              </Link>

              {/* Join Portal */}

              <Link
                to="/signup"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-cyan-500 to-purple-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-800"
              >
                <span className="relative px-4 py-1.5 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0">
                  Join Portal
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* ==========================================
            MOBILE MENU BUTTON
        ========================================== */}

        <button
          type="button"
          onClick={toggleMenu}
          className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1.5 rounded-lg hover:bg-slate-900/60"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* ==========================================
          MOBILE DRAWER
      ========================================== */}

      {isOpen && (
        <div className="md:hidden glass-panel-heavy border-b border-slate-800 px-6 py-4 space-y-3">

          {/* Navigation */}

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition ${
                  active
                    ? "bg-slate-850 text-cyan-400 border-l-2 border-cyan-400"
                    : "text-slate-400 hover:bg-slate-900/40 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />

                {link.name}
              </Link>
            );
          })}

          {/* User actions */}

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">

            {user ? (
              <>
                {/* Profile */}

                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-900/40 rounded-xl transition"
                >
                  <User className="w-5 h-5" />

                  My Profile ({user.name})
                </Link>

                {/* Logout */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-950/20 rounded-xl transition text-left cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />

                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">

                {/* Sign In */}

                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900/40 transition text-sm font-medium"
                >
                  Sign In
                </Link>

                {/* Join Portal */}

                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium text-sm transition shadow-lg shadow-cyan-950/40"
                >
                  Join Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;