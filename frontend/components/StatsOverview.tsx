'use client';

import { Bus, Route, Users, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalBuses: number;
    activeBuses: number;
    totalRoutes: number;
    avgOccupancy: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Buses',
      value: stats.totalBuses,
      icon: Bus,
      color: 'from-blue-500 to-blue-600',
      change: '+2',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Buses',
      value: stats.activeBuses,
      icon: Bus,
      color: 'from-green-500 to-green-600',
      change: `${Math.round((stats.activeBuses / stats.totalBuses) * 100)}%`,
      changeType: 'neutral' as const,
    },
    {
      title: 'Routes',
      value: stats.totalRoutes,
      icon: Route,
      color: 'from-purple-500 to-purple-600',
      change: '5',
      changeType: 'neutral' as const,
    },
    {
      title: 'Avg Occupancy',
      value: `${stats.avgOccupancy}%`,
      icon: Users,
      color: 'from-orange-500 to-orange-600',
      change: '+5%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {stat.change}
              </span>
              <span className="text-xs text-white opacity-75 ml-2">vs last hour</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

