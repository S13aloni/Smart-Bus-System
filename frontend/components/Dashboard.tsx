'use client';

import { useState, useEffect } from 'react';
import LiveTracking from './LiveTracking';
import DemandPrediction from './DemandPrediction';
import BeforeAfterComparison from './BeforeAfterComparison';
import RidershipComparison from './RidershipComparison';
import SchedulingEngine from './SchedulingEngine';
import RouteProgress from './RouteProgress';
import StatsOverview from './StatsOverview';
import NotificationsPage from './NotificationsPage';
import { enhancedDataService, BusData } from '@/lib/enhancedDataService';

interface DashboardProps {
  activeTab: string;
}

export default function Dashboard({ activeTab }: DashboardProps) {
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    operationalBuses: 0,
    totalRoutes: 0,
    avgOccupancy: 0,
    breakdowns: 0,
  });
  const [buses, setBuses] = useState<BusData[]>([]);

  useEffect(() => {
    // Fetch initial stats from enhanced data service
    fetchStats();
    
    // Set up real-time updates
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const busesData = enhancedDataService.getLiveBusData();
      const routes = enhancedDataService.getRoutes();
      
      const activeBuses = busesData.filter(bus => bus.status === 'on_time' || bus.status === 'delayed').length;
      const operationalBuses = busesData.filter(bus => bus.is_operational).length;
      const breakdowns = busesData.filter(bus => bus.status === 'breakdown').length;
      const avgOccupancy = busesData.length > 0 
        ? Math.round(busesData.reduce((sum, bus) => sum + bus.occupancy_percentage, 0) / busesData.length)
        : 0;

      setBuses(busesData);
      setStats({
        totalBuses: busesData.length,
        activeBuses,
        operationalBuses,
        totalRoutes: routes.length,
        avgOccupancy,
        breakdowns,
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
      case 'ridership-analysis':
        return <RidershipComparison />;
      case 'scheduling-engine':
        return <SchedulingEngine />;
      case 'route-progress':
        return <RouteProgress buses={buses} />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <LiveTracking />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview - only show for non-notification pages */}
      {activeTab !== 'notifications' && (
        <StatsOverview stats={stats} />
      )}

      {/* Tab Content */}
      <div className={activeTab === 'notifications' ? '' : 'enhanced-card'}>
        {renderTabContent()}
      </div>
    </div>
  );
}