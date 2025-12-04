import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Terminal from "./Terminal";

const Header = ({ theme, setTheme }) => {
  const [showTerminal, setShowTerminal] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", label: "HOME", emoji: "🏠" },
    { path: "/search", label: "SEARCH", emoji: "🔍" },
    { path: "/report", label: "REPORT", emoji: "🚨" },
    { path: "/scam-list", label: "SCAM LIST", emoji: "📋" },
    { path: "/insurance-fund", label: "INSURANCE", emoji: "🛡️" },
    { path: "/dashboard", label: "DASHBOARD", emoji: "📊" },
    { path: "/admin", label: "ADMIN", emoji: "⚙️" },
  ];

  const themes = [
    { id: "hacker", label: "CLASSIC", color: "text-green-400" },
    { id: "matrix", label: "MATRIX", color: "text-green-300" },
    { id: "cyberpunk", label: "CYBERPUNK", color: "text-purple-400" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-black bg-opacity-90 backdrop-blur-sm border-b border-green-600">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">CS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold glow-green">
                  CHECKSCAM<span className="blink">_</span>
                </h1>
                <p className="text-xs text-green-300">HỆ THỐNG CHỐNG LỪA ĐẢO</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    location.pathname === item.path
                      ? "bg-green-900 border-green-500 text-white"
                      : "border-green-800 hover:bg-green-900 hover:border-green-500"
                  }`}
                >
                  <span className="mr-2">{item.emoji}</span>
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Theme Selector and Terminal */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm">THEME:</span>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="bg-black border border-green-600 text-green-400 px-2 py-1 rounded text-sm"
                >
                  {themes.map((t) => (
                    <option key={t.id} value={t.id} className={t.color}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowTerminal(!showTerminal)}
                className="px-4 py-2 bg-green-900 border border-green-500 rounded-lg hover:bg-green-800 transition-all flex items-center"
              >
                <span className="mr-2">💻</span>
                <span className="font-bold">TERMINAL</span>
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span>SYSTEM: ONLINE</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>API: CONNECTED</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span>DATABASE: LIVE</span>
              </div>
            </div>
            <div className="text-green-300">
              <span className="mr-4">USER: ANONYMOUS</span>
              <span>IP: 127.0.0.1</span>
            </div>
          </div>
        </div>
      </header>

      {/* Terminal Popup */}
      {showTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <Terminal onClose={() => setShowTerminal(false)} />
        </div>
      )}
    </>
  );
};

export default Header;
