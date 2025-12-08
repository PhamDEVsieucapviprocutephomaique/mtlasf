import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MatrixRain from "./components/MatrixRain";
import HackerTheme from "./components/HackerTheme";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Report from "./pages/Report";
import ScamList from "./pages/ScamList";
import InsuranceFund from "./pages/InsuranceFund";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";

function App() {
  const [theme, setTheme] = useState("cyberpunk");

  return (
    <Router>
      <ErrorBoundary>
        <HackerTheme theme={theme}>
          <MatrixRain />
          <div className="min-h-screen flex flex-col relative z-10">
            <Header theme={theme} setTheme={setTheme} />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/report" element={<Report />} />
                <Route path="/scam-list" element={<ScamList />} />
                <Route path="/insurance-fund" element={<InsuranceFund />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/adminsetting" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </HackerTheme>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
