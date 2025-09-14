'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Clock, MapPin, AlertTriangle, CheckCircle, Eye, EyeOff, Filter, Search, RefreshCw, ChevronDown, Settings, Download, Zap, Battery, Wifi, AlertCircle, Car, Route, Users, Shield } from 'lucide-react';
import { Notification, NotificationStats } from '@/types/notifications';
import { notificationService } from '@/services/notificationService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, critical: 0, major: 0, minor: 0, unread: 0 });
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'major' | 'minor'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((newNotifications) => {
      setNotifications(newNotifications);
      setStats(notificationService.getNotificationStats());
    });

    // Initial load
    setNotifications(notificationService.getNotifications());
    setStats(notificationService.getNotificationStats());

    // Mark all notifications as read when user visits this page
    notificationService.markAllAsRead();

    return unsubscribe;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const newTimeLeft: Record<string, number> = {};
      
      notifications.forEach(notification => {
        const timeRemaining = notification.autoExpiry.getTime() - now.getTime();
        newTimeLeft[notification.id] = Math.max(0, Math.floor(timeRemaining / 1000));
      });
      
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [notifications]);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Expired';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-50 hover:bg-red-100';
      case 'major':
        return 'border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100';
      case 'minor':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      default:
        return 'border-l-4 border-l-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'major':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'minor':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAlertTypeIcon = (alertType: string) => {
    switch (alertType.toLowerCase()) {
      case 'mechanical':
        return <Settings className="h-6 w-6 text-red-600" />;
      case 'delay':
        return <Clock className="h-6 w-6 text-yellow-600" />;
      case 'safety':
        return <Shield className="h-6 w-6 text-blue-600" />;
      case 'congestion':
        return <Users className="h-6 w-6 text-purple-600" />;
      case 'route deviation':
        return <Route className="h-6 w-6 text-orange-600" />;
      case 'maintenance':
        return <Wrench className="h-6 w-6 text-green-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
  };

  const handleDismiss = (notificationId: string) => {
    notificationService.dismissNotification(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleRefresh = () => {
    setNotifications(notificationService.getNotifications());
    setStats(notificationService.getNotificationStats());
  };

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.busId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.routeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.alertType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || notification.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unread' && !notification.isRead) ||
      (statusFilter === 'read' && notification.isRead);

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg mr-3 shadow-md">
                <Bell className="h-7 w-7 text-white" />
              </div>
              Alerts & Notifications
            </h1>
            <p className="text-gray-600">Monitor system alerts and fleet notifications in real-time</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 hover:scale-105 shadow-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            {stats.unread > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-green-600 hover:bg-green-50 hover:border-green-200 transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Mark All Read</span>
              </button>
            )}
            {/* <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 hover:scale-105 shadow-sm">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button> */}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">Active notifications</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Bell className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Critical</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                <p className="text-xs text-gray-500 mt-1">Requires immediate action</p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Major</p>
                <p className="text-3xl font-bold text-orange-600">{stats.major}</p>
                <p className="text-xs text-gray-500 mt-1">Needs attention soon</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertTriangle className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Unread</p>
                <p className="text-3xl font-bold text-blue-600">{stats.unread}</p>
                <p className="text-xs text-gray-500 mt-1">Pending review</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <EyeOff className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-md mb-6">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts by bus ID, route, or message..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all duration-300 shadow-sm"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Expanded Filters */}
          {isFiltersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-5 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'critical', 'major', 'minor'].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setSeverityFilter(severity as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        severityFilter === severity
                          ? severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200'
                            : severity === 'major' ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : severity === 'minor' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {severity.charAt(0).toUpperCase() + severity.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'unread', 'read'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        statusFilter === status
                          ? status === 'unread' ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : status === 'read' ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-md">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No alerts found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {notifications.length === 0 
                  ? "All systems operating normally - no active alerts"
                  : "No alerts match your current filters"
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg ${
                  getSeverityStyles(notification.severity)
                } ${!notification.isRead ? 'ring-2 ring-blue-200' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                      {getAlertTypeIcon(notification.alertType)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(notification.severity)}
                        <div>
                          <span className="text-lg font-semibold text-gray-900">
                            {notification.busId}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            Route {notification.routeNumber}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          notification.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          notification.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {notification.severity}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDismiss(notification.id)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Dismiss alert"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Alert Type */}
                    <div className="mb-4">
                      <span className="text-lg font-medium text-gray-900 capitalize">
                        {notification.alertType}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Location */}
                    {notification.location && (
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">{notification.location}</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between pt-4 border-t border-gray-200 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {notification.timestamp.toLocaleString()}
                          </span>
                        </div>
                        {notification.isRead ? (
                          <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Read
                          </span>
                        ) : (
                          <span className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                            Unread
                          </span>
                        )}
                      </div>
                      
                      {/* Countdown Timer */}
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          timeLeft[notification.id] > 300 ? 'bg-green-500' : 
                          timeLeft[notification.id] > 60 ? 'bg-yellow-500' : 'bg-red-500'
                        } animate-pulse`}></div>
                        <span className="text-sm text-gray-600 font-mono">
                          Expires in: {formatTimeRemaining(timeLeft[notification.id] || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Estimated Resolution */}
                    {notification.estimatedResolution && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-600">
                            Estimated resolution: {notification.estimatedResolution.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Wrench icon component
function Wrench(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}