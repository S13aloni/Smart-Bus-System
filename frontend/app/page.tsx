'use client';

import { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';

export default function Home() {
  const [activeTab, setActiveTab] = useState('live-tracking');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}