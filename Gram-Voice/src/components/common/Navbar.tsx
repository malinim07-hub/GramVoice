import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { History, User, LogOut, Menu, X, LayoutDashboard, Megaphone, FileText, Building2, Languages } from "lucide-react";
import { useAuth } from "../../context/AuthContext";


const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = user
    ? user.role === "admin"
      ? [{ path: "/gov", name: "Gov Portal", icon: Building2 }]
      : [
          { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
          { path: "/report", name: "Report Issue", icon: FileText },
          { path: "/translation", name: "AI Translator", icon: Languages },
          { path: "/history", name: "My Reports", icon: History },
        ]
    : [
        { path: "/", name: "Home", icon: Megaphone },
        { path: "/report", name: "Report Issue", icon: FileText },
        { path: "/translation", name: "AI Translator", icon: Languages },
      ];




  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass-panel-heavy border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={user ? (user.role === "admin" ? "/gov" : "/dashboard") : "/"}
          className="flex items-center gap-2 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 hover:opacity-90 transition"
        >
          <Megaphone className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="tracking-tight text-glow">GramVoice</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-slate-300">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition duration-205 hover:text-white ${
                  active
                    ? "bg-slate-800/50 text-cyan-400 border border-cyan-500/20"
                    : "hover:bg-slate-900/50 text-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : ""}`} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Auth Actions / User Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-600 transition"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs shadow-md">
                  {user.name.charAt(0)}
                </div>
                <span className="text-slate-300 text-sm font-medium">{user.name}</span>
              </button>

              {/* User Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition"
                  >
                    <User className="w-4 h-4" />
                    My Profile / Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-cyan-500 to-purple-500 group-hover:from-cyan-500 group-hover:to-purple-500 hover:text-white focus:ring-4 focus:outline-none focus:ring-cyan-800"
              >
                <span className="relative px-4 py-1.5 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0">
                  Join Portal
                </span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-slate-400 hover:text-white focus:outline-none p-1.5 rounded-lg hover:bg-slate-900/60"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel-heavy border-b border-slate-800 px-6 py-4 space-y-3">
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

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-900/40 rounded-xl transition"
                >
                  <User className="w-5 h-5" />
                  My Profile ({user.name})
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-rose-950/20 rounded-xl transition text-left"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900/40 transition text-sm font-medium"
                >
                  Sign In
                </Link>
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