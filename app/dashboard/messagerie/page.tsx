"use client";
import React from "react";
import MessageryDashboard from "./components/messagery-dashboard";

export default function MessageryPage() {
  return (
    <div className="container mx-auto px-6 h-full">
      <div className="flex flex-col h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">💬 Messagerie</h1>
          <p className="text-gray-600 mt-2">
            Gérez vos conversations avec les clients et les GP
          </p>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
          <MessageryDashboard />
        </div>
      </div>
    </div>
  );
}
