'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live-tracking');

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}

