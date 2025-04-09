"use client";
import { useState } from "react";
import Navbar from "@/components/ui/navbar";
import Sidebar from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="w-full h-screen">
      <div className="grid grid-cols-12 h-full w-full">
        {/* Sidebar for mobile */}
        <div
          className={`${
            sidebarOpen ? "fixed inset-0 z-40 block" : "hidden"
          } md:hidden`}
        >
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={toggleSidebar}
          ></div>
          <div className="relative w-64 h-full z-50 bg-red-700">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          </div>
        </div>

        {/* Sidebar for desktop */}
        <div className="hidden md:block md:col-span-2 h-full bg-red-700">
          <Sidebar isOpen={true} toggleSidebar={toggleSidebar} />
        </div>

        {/* Main content */}
        <div
          className={`col-span-12 md:col-span-10 h-full flex flex-col bg-white`}
        >
          <div className="h-[8vh]">
            <Navbar toggleSidebar={toggleSidebar} />
          </div>
          <div className="max-h-[92vh] overflow-y-auto">
            <section className="p-4">{children}</section>
          </div>
        </div>
      </div>
    </div>
  );
}
