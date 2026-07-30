import React from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation bar */}
      <Navbar />

      {/* Main content body */}
      <main className="flex-grow pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
