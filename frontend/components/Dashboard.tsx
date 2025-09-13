'use client';

import { useState, useEffect } from 'react';
import LiveTracking from './LiveTracking';
import DemandPrediction from './DemandPrediction';
import BeforeAfterComparison from './BeforeAfterComparison';
import StatsOverview from './StatsOverview';

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
    // Fetch initial stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [busesResponse, routesResponse, passengersResponse] = await Promise.all([
        fetch('/api/buses'),
        fetch('/api/routes'),
        fetch('/api/passengers/current'),
      ]);

      const buses = await busesResponse.json();
      const routes = await routesResponse.json();
      const passengers = await passengersResponse.json();

      const activeBuses = buses.filter((bus: any) => bus.status === 'active').length;
      const avgOccupancy = passengers.length > 0 
        ? passengers.reduce((sum: number, p: any) => sum + p.occupancy_percentage, 0) / passengers.length 
        : 0;

      setStats({
        totalBuses: buses.length,
        activeBuses,
        totalRoutes: routes.length,
        avgOccupancy: Math.round(avgOccupancy),
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {renderTabContent()}
      </div>
    </div>
  );
}

