import { Link } from "react-router-dom";
import { Megaphone, Globe, Share2, MessageSquare, Shield, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <Megaphone className="w-6 h-6 text-cyan-400" />
              <span>GramVoice</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm">
              Empowering local communities by enabling instant, AI-verified civic issue reporting. Supporting citizens in raising their voices and helping governments resolve complaints efficiently.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <a href="#" className="hover:text-cyan-400 transition"><Globe className="w-5 h-5" /></a>
              <a href="#" className="hover:text-cyan-400 transition"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="hover:text-cyan-400 transition"><MessageSquare className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Citizen Portal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/report" className="hover:text-cyan-400 transition">Report an Issue</Link></li>
              <li><Link to="/history" className="hover:text-cyan-400 transition">Track My Reports</Link></li>
              <li><Link to="/gov" className="hover:text-cyan-400 transition">Government Portal</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition">Citizen Dashboard</Link></li>
            </ul>
          </div>

          {/* Legal / Help */}
          <div>
            <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Support & Trust</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> <a href="#" className="hover:text-cyan-400 transition">Citizen Help Center</a></li>
              <li className="flex items-center gap-2"><Shield className="w-4 h-4" /> <a href="#" className="hover:text-cyan-400 transition">Privacy & Data Security</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Grievance Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} GramVoice. Supporting local governance and citizen action.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-400 transition font-medium">Privacy</a>
            <a href="#" className="hover:text-slate-400 transition font-medium">Terms</a>
            <a href="#" className="hover:text-slate-400 transition font-medium">Municipal Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
