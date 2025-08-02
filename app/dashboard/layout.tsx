"use client";
import { useState } from "react";
import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="flex h-full w-full">
        {/* Sidebar for mobile - overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleSidebar}
            />
            <div className="relative w-80 h-full z-50">
              <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            </div>
          </div>
        )}

        {/* Sidebar for desktop - hover effect */}
        <div
          className={`hidden lg:block h-full bg-red-700 transition-all duration-300 ease-in-out ${
            sidebarHovered ? "w-80" : "w-20"
          }`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <Sidebar
            isOpen={true}
            toggleSidebar={toggleSidebar}
            isHovered={sidebarHovered}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 h-full flex flex-col bg-white overflow-hidden">
          {/* Navbar */}
          <div className="h-16 lg:h-20 flex-shrink-0">
            <Navbar toggleSidebar={toggleSidebar} />
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <section className="p-4 lg:p-6">{children}</section>
          </div>
        </div>
      </div>
    </div>
  );
}
