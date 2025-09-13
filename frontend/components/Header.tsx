'use client';

import { Bus, BarChart3, MapPin, Settings, TrendingUp, AlertTriangle, Cpu, Route } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'live-tracking', label: 'Live Tracking', icon: MapPin },
  { id: 'route-progress', label: 'Route Progress', icon: Route },
  { id: 'demand-prediction', label: 'Demand Prediction', icon: BarChart3 },
  { id: 'before-after', label: 'Schedule Optimization', icon: Settings },
  { id: 'ridership-analysis', label: 'Ridership Analysis', icon: TrendingUp },
  { id: 'scheduling-engine', label: 'Scheduling Engine', icon: Cpu },
];

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-md">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Smart Bus System</h1>
              <p className="text-sm text-blue-100">AI-Powered Optimization Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-md transform scale-105'
                      : 'text-blue-100 hover:text-white hover:bg-blue-500 hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-white font-medium">Live</span>
            </div>
            <div className="lg:hidden">
              <button className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <nav className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-md'
                      : 'text-blue-100 hover:text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}