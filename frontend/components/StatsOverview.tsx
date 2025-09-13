'use client';

import { Bus, Route, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalBuses: number;
    activeBuses: number;
    operationalBuses: number;
    totalRoutes: number;
    avgOccupancy: number;
    breakdowns: number;
  };
  alerts: number;
}

export default function StatsOverview({ stats, alerts }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Buses',
      value: stats.totalBuses,
      icon: Bus,
      color: 'from-blue-500 to-blue-600',
      change: 'Ahmedabad Fleet',
      changeType: 'neutral' as const,
    },
    {
      title: 'Operational Buses',
      value: stats.operationalBuses,
      icon: Bus,
      color: 'from-green-500 to-green-600',
      change: `${Math.round((stats.operationalBuses / stats.totalBuses) * 100)}%`,
      changeType: 'positive' as const,
    },
    {
      title: 'Ahmedabad Routes',
      value: stats.totalRoutes,
      icon: Route,
      color: 'from-purple-500 to-purple-600',
      change: '8 Active',
      changeType: 'neutral' as const,
    },
    {
      title: 'Avg Occupancy',
      value: `${stats.avgOccupancy}%`,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      change: 'Peak Hours',
      changeType: 'positive' as const,
    },
    {
      title: 'Breakdowns',
      value: stats.breakdowns,
      icon: AlertTriangle,
      color: stats.breakdowns > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600',
      change: stats.breakdowns > 0 ? 'Needs Repair' : 'All Good',
      changeType: stats.breakdowns > 0 ? 'negative' as const : 'neutral' as const,
    },
    {
      title: 'Active Alerts',
      value: alerts,
      icon: AlertTriangle,
      color: alerts > 0 ? 'from-yellow-500 to-yellow-600' : 'from-gray-500 to-gray-600',
      change: alerts > 0 ? 'Weather/Traffic' : 'All Clear',
      changeType: alerts > 0 ? 'negative' as const : 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`stat-card bg-gradient-to-r ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-white opacity-90">
                {stat.changeType === 'positive' && '+'}
                {stat.changeType === 'negative' && alerts > 0 && '⚠️ '}
                {stat.change}
              </span>
              <span className="text-xs text-white opacity-75 ml-2">
                {stat.changeType === 'positive' ? 'vs last hour' : 
                 stat.changeType === 'negative' ? 'needs attention' : 'active'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}