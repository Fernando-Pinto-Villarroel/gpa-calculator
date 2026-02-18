import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Calculator, Settings, GraduationCap } from "lucide-react";
import AnimatedBackground from "./AnimatedBackground";

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      <nav className="relative z-10 bg-cosmic-900/80 backdrop-blur-lg border-b border-jala-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-jala-blue-500 to-space-600 rounded-lg flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Jala University
                  </h1>
                  <p className="text-sm text-jala-blue-300">GPA Calculator</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === "/"
                    ? "bg-jala-blue-600/30 text-jala-blue-300 backdrop-blur-sm border border-jala-blue-400/30"
                    : "text-cosmic-300 hover:text-jala-blue-300 hover:bg-cosmic-800/50"
                }`}
              >
                <Calculator className="w-5 h-5" />
                <span className="hidden sm:inline">Calculator</span>
              </Link>

              <Link
                to="/config"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  location.pathname === "/config"
                    ? "bg-jala-blue-600/30 text-jala-blue-300 backdrop-blur-sm border border-jala-blue-400/30"
                    : "text-cosmic-300 hover:text-jala-blue-300 hover:bg-cosmic-800/50"
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">Configuration</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
