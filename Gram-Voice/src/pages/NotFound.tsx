import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import MainLayout from "../layouts/MainLayout";

const NotFound = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-950/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-4xl font-extrabold text-white">Page Not Found</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            The page you are looking for does not exist or has been moved to a new destination.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-semibold text-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </MainLayout>
  );
};

export default NotFound;