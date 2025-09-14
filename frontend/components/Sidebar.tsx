'use client';

import { useState, useEffect } from 'react';
import { Bus, BarChart3, MapPin, Settings, TrendingUp, Cpu, Route, X, Menu, Wifi, WifiOff, ChevronDown, User, Bell, HelpCircle, LogOut, Search, Cloud, Database, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { notificationService } from '@/services/notificationService';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const tabs = [
  { id: 'live-tracking', label: 'Live Tracking', icon: MapPin, description: 'Real-time vehicle locations' },
  { id: 'route-progress', label: 'Route Progress', icon: Route, description: 'Monitor route performance' },
  { id: 'demand-prediction', label: 'Demand Prediction', icon: BarChart3, description: 'Forecast passenger demand' },
  { id: 'before-after', label: 'Schedule Optimization', icon: Settings, description: 'Optimize bus schedules' },
  { id: 'ridership-analysis', label: 'Ridership Analysis', icon: TrendingUp, description: 'Analyze passenger patterns' },
  { id: 'scheduling-engine', label: 'Scheduling Engine', icon: Cpu, description: 'AI-powered scheduling' },
  { id: 'notifications', label: 'Alerts & Notifications', icon: Bell, description: 'System alerts and notifications' },
];

export default function Sidebar({ activeTab, onTabChange, onCollapseChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to notification updates
  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    });

    // Initial load
    const notifications = notificationService.getNotifications();
    const unread = notifications.filter(n => !n.isRead).length;
    setUnreadCount(unread);

    return unsubscribe;
  }, []);

  // Close mobile menu when a tab is selected
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setIsMobileMenuOpen(false);
  };

  // Handle sidebar collapse
  const handleCollapseToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  // Filter tabs based on search query
  const filteredTabs = tabs.filter(tab => 
    tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-gray-900/95 via-blue-900/95 to-gray-900/95 backdrop-blur-md transition-all duration-500 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } min-h-screen fixed left-0 top-0 z-40 border-r border-white/10 shadow-2xl`}>
        
        {/* Logo and Toggle Button Container */}
        <div className="relative p-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg transform rotate-12 ring-2 ring-blue-400/30">
                  <Bus className="h-7 w-7 text-white transform -rotate-12" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900 shadow-sm"></div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-white tracking-tight">Smart Bus</h1>
                  <p className="text-xs text-blue-300/80 font-light">AI Transit Platform</p>
                </div>
              )}
            </div>
            
            {/* Toggle Button - Positioned differently based on state */}
            {!isCollapsed && (
              <button
                onClick={handleCollapseToggle}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Toggle Button when sidebar is collapsed - Positioned above bus icon */}
          {isCollapsed && (
            <button
              onClick={handleCollapseToggle}
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-50 p-1.5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full border-2 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        {/* Search Bar (only when expanded) */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex flex-col p-4 space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          {filteredTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center p-3 rounded-xl transition-all duration-300 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white shadow-lg ring-1 ring-blue-500/20'
                    : 'text-blue-200/90 hover:text-white hover:bg-white/5'
                }`}
                title={isCollapsed ? tab.label : undefined}
              >
                <div className={`relative ${isCollapsed ? '' : 'mr-3'}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isActive && !isCollapsed && (
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-lg blur-sm z-0"></div>
                  )}
                  {/* Notification indicator for notifications tab */}
                  {tab.id === 'notifications' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                  )}
                </div>
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{tab.label}</span>
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-blue-300/70 font-light">{tab.description}</span>
                    </div>
                    {isActive && (
                      <div className="absolute right-3 w-1.5 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                    )}
                  </>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            );
          })}
        </nav>

        

        {/* User controls */}
        <div className="p-4 border-t border-white/10 space-y-3">
          
          
          
          
          <div className="flex items-center space-x-3 bg-white/5 rounded-xl p-3 border border-white/10 group hover:bg-white/10 transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <User className="h-4 w-4 text-white" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">Admin User</span>
                  <span className="text-xs text-blue-300/70">Administrator</span>
                </div>
                <button className="ml-auto text-white/70 hover:text-white transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 via-blue-900/95 to-gray-900/95 backdrop-blur-md border-b border-white/10">
        {/* Top status bar */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-1.5 px-4 text-xs text-white text-center">
          <div className="flex justify-between items-center">
            <span className="flex items-center">
              <Zap className="h-3 w-3 mr-1.5 animate-pulse" />
              Real-time transit analytics platform
            </span>
            <div className="flex items-center space-x-2">
              <span className="flex items-center">
                {isOnline ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" /> Online
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" /> Offline
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg transform rotate-12 ring-2 ring-blue-400/30">
                  <Bus className="h-6 w-6 text-white transform -rotate-12" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Smart Bus</h1>
                <p className="text-xs text-blue-300/80">AI Transit Platform</p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors border border-white/10 backdrop-blur-sm"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Full screen overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-blue-900/95 backdrop-blur-md z-50 pt-16">
            <div className="flex flex-col h-full">
              {/* Search Bar */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-300/70" />
                  <input
                    type="text"
                    placeholder="Search features..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
                  />
                </div>
              </div>

              {/* User info in mobile menu */}
              <div className="flex items-center space-x-3 p-4 border-b border-white/10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Administrator</h3>
                  <p className="text-blue-300 text-sm">admin@smartbussystem.com</p>
                </div>
              </div>
              
              {/* Mobile status indicator */}
              <div className="flex items-center justify-between p-4 bg-white/5">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-white">
                    {isOnline ? 'System Online' : 'System Offline'}
                  </span>
                </div>
                <span className="text-blue-300 text-sm">v2.1.0</span>
              </div>
              
              {/* Mobile navigation tabs */}
              <nav className="flex flex-col p-4 space-y-2 flex-grow overflow-y-auto custom-scrollbar">
                {filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center space-x-4 p-4 rounded-xl text-left transition-all duration-300 relative group ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-white shadow-lg ring-1 ring-blue-500/20'
                          : 'text-blue-200/90 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <Icon className="h-5 w-5" />
                        {/* Notification indicator for notifications tab in mobile */}
                        {tab.id === 'notifications' && unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium">{tab.label}</span>
                          {tab.id === 'notifications' && unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-blue-300/70 font-light">{tab.description}</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  );
                })}
              </nav>
              
              {/* Mobile menu footer */}
              <div className="p-4 border-t border-white/10">
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <button className="flex flex-col items-center p-2 rounded-xl text-white hover:bg-white/5 transition-colors">
                    <HelpCircle className="h-5 w-5 mb-1" />
                    <span className="text-xs">Help</span>
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-xl text-white hover:bg-white/5 transition-colors relative">
                    <div className="relative">
                      <Bell className="h-5 w-5 mb-1" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse"></span>
                      )}
                    </div>
                    <span className="text-xs">Alerts</span>
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-4 w-2 h-2 bg-red-500 rounded-full ring-2 ring-gray-900"></span>
                    )}
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-xl text-white hover:bg-white/5 transition-colors">
                    <Settings className="h-5 w-5 mb-1" />
                    <span className="text-xs">Settings</span>
                  </button>
                  <button className="flex flex-col items-center p-2 rounded-xl text-white hover:bg-white/5 transition-colors">
                    <LogOut className="h-5 w-5 mb-1" />
                    <span className="text-xs">Logout</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors font-medium"
                >
                  <X className="h-5 w-5 mr-2" />
                  Close Menu
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </>
  );
}