import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import DashboardView from '../views/DashboardView';
import ProjectsView from '../views/ProjectsView';
import DrillholesView from '../views/DrillholeView';
import MineImg from '../assets/Mine.jpg';
import { useAuth } from '../context/authContext'
import SamplesView from '../views/SamplesView';

export default function MainDashboard() {
  const { user } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [token] = useState(localStorage.getItem("token"));

  const viewTitles = {
    dashboard: "Main",
    projects: "Projects",
    drillholes: "Drillholes",
    samples: "Samples",
    assays: "Assay Results",
    geology: "Geology Logs",
    analytics: "Analytics",
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView token={token} />;
      case "projects":
        return <ProjectsView token={token} />;
      case "drillholes":
        return <DrillholesView token={token} />;
        case "samples":
        return <SamplesView token={token} />;
      default:
        return (
          <div className="text-center py-12 text-white/80 text-lg">
            Coming soon...
          </div>
        );
    }
  };

  return (
    <div
      className="relative min-h-screen flex bg-cover bg-center"
      style={{ backgroundImage: `url(${MineImg})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Main content wrapper */}
      <div className="relative flex w-full h-full z-10">
        
        {/* Sidebar */}
        <div className="hidden md:flex m-4">
          <Sidebar
            isOpen={sidebarOpen}
            setIsOpen={setSidebarOpen}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="m-4">
            <Header title={viewTitles[currentView]} setIsOpen={setSidebarOpen} />
          </div>

          {/* Main view content */}
          <main className="flex-1 overflow-auto px-4 pb-4 text-white">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
}
