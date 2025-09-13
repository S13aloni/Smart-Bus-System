'use client';

import { useState, useEffect } from 'react';
import LiveTracking from './LiveTracking';
import DemandPrediction from './DemandPrediction';
import BeforeAfterComparison from './BeforeAfterComparison';
import StatsOverview from './StatsOverview';
import { dataService } from '@/lib/dataService';

interface DashboardProps {
  activeTab: string;
}

export default function Dashboard({ activeTab }: DashboardProps) {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    totalRoutes: 0,
    avgOccupancy: 0,
  });

  useEffect(() => {
    // Fetch initial stats from data service
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const buses = dataService.getLiveBusData();
      const routes = dataService.getRoutes();
      
      const activeBuses = buses.filter(bus => bus.status === 'active').length;
      const avgOccupancy = buses.length > 0 
        ? Math.round(buses.reduce((sum, bus) => sum + bus.occupancy_percentage, 0) / buses.length)
        : 0;

      setStats({
        totalBuses: buses.length,
        activeBuses,
        totalRoutes: routes.length,
        avgOccupancy,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'live-tracking':
        return <LiveTracking />;
      case 'demand-prediction':
        return <DemandPrediction />;
      case 'before-after':
        return <BeforeAfterComparison />;
      default:
        return <LiveTracking />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview stats={stats} />

      {/* Tab Content */}
      <div className="enhanced-card">
        {renderTabContent()}
      </div>
    </div>
  );
}