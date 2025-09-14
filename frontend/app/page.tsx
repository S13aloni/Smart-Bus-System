'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Sidebar from '@/components/Sidebar';

export default function Home() {
  const [activeTab, setActiveTab] = useState('live-tracking');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 lg:ml-0 ml-0 px-4 py-8 overflow-x-auto">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}