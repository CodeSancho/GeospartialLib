import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import DashboardView from '../views/DashboardView';
import ProjectsView from '../views/ProjectsView';
import DrillholesView from '../views/DrillholeView';
import MineImg from '../assets/Mine.jpg';
import { useAuth } from '../context/authContext'
import SamplesView from '../views/SamplesView';
import RecordsView from '../views/RecordsView';
import SpatialMapView from '../views/SpatialMapView';
import AnalyticsView from '../views/AnalyticsView';

export default function MainDashboard() {
  const { user } = useAuth(); 
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [currentView, setCurrentView] = useState("dashboard");
  const [token] = useState(localStorage.getItem("token"));

  const viewTitles = {
    dashboard: "Main",
    map: "Spatial map",
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
      case "map":
        return <SpatialMapView token={token} />;
      case "projects":
        return <ProjectsView token={token} />;
      case "drillholes":
        return <DrillholesView token={token} />;
        case "samples":
        return <SamplesView token={token} />;
      case "assays":
        return <RecordsView token={token} kind="assays" />;
      case "geology":
        return <RecordsView token={token} kind="geology" />;
      case "analytics":
        return <AnalyticsView token={token} />;
      default:
        return (
          <div className="rounded-xl bg-white p-8 text-center text-slate-700">Select a section from the navigation.</div>
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
        <div className="fixed inset-y-0 left-0 z-40 md:static md:m-4">
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
            <Header title={viewTitles[currentView]} setIsOpen={setSidebarOpen} user={user} />
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
