'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('live-tracking');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCollapseChange={setIsSidebarCollapsed}
      />
      <main className={`lg:ml-20 transition-all duration-500 ease-in-out px-2 sm:px-4 py-4 sm:py-8 overflow-x-auto ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      } lg:pt-8 pt-20`}>
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}