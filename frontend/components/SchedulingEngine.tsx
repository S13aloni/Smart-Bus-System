'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Clock, Bus, Route, Settings, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { enhancedDataService } from '@/lib/enhancedDataService';

interface ScheduleUpdate {
  bus_id: number;
  route_id: number;
  original_departure: string;
  new_departure: string;
  adjustment_minutes: number;
  reason: string;
  timestamp: string;
  status: 'pending' | 'applied' | 'rejected';
}

interface SchedulingMetrics {
  total_adjustments: number;
  average_delay_reduction: number;
  efficiency_improvement: number;
  on_time_performance: number;
}

export default function SchedulingEngine() {
  const [scheduleUpdates, setScheduleUpdates] = useState<ScheduleUpdate[]>([]);
  const [metrics, setMetrics] = useState<SchedulingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAutoScheduling, setIsAutoScheduling] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSchedulingData();
    const interval = setInterval(fetchSchedulingData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSchedulingData = async () => {
    try {
      // Simulate scheduling engine data
      const updates = generateScheduleUpdates();
      const schedulingMetrics = calculateSchedulingMetrics(updates);
      
      setScheduleUpdates(updates);
      setMetrics(schedulingMetrics);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching scheduling data:', error);
      setLoading(false);
    }
  };

  const generateScheduleUpdates = (): ScheduleUpdate[] => {
    const buses = enhancedDataService.getLiveBusData();
    const updates: ScheduleUpdate[] = [];

    buses.forEach(bus => {
      if (bus.schedule.delay_minutes > 5) {
        const adjustment = Math.floor(Math.random() * 10) - 5; // -5 to +5 minutes
        const originalDeparture = new Date(bus.schedule.planned_departure);
        const newDeparture = new Date(originalDeparture.getTime() + adjustment * 60000);
        
        updates.push({
          bus_id: bus.bus_id,
          route_id: bus.route_id,
          original_departure: originalDeparture.toISOString().substring(11, 16),
          new_departure: newDeparture.toISOString().substring(11, 16),
          adjustment_minutes: adjustment,
          reason: getAdjustmentReason(adjustment, bus.schedule.delay_minutes),
          timestamp: new Date().toISOString(),
          status: Math.random() > 0.2 ? 'applied' : 'pending'
        });
      }
    });

    return updates;
  };

  const getAdjustmentReason = (adjustment: number, delay: number): string => {
    if (adjustment > 0) {
      return `Delayed by ${delay} minutes - rescheduling to reduce bunching`;
    } else if (adjustment < 0) {
      return `Advanced by ${Math.abs(adjustment)} minutes for better headway`;
    } else {
      return 'Minor adjustment for optimal spacing';
    }
  };

  const calculateSchedulingMetrics = (updates: ScheduleUpdate[]): SchedulingMetrics => {
    const appliedUpdates = updates.filter(update => update.status === 'applied');
    const totalAdjustments = appliedUpdates.length;
    const averageDelayReduction = appliedUpdates.length > 0 
      ? appliedUpdates.reduce((sum, update) => sum + Math.abs(update.adjustment_minutes), 0) / appliedUpdates.length
      : 0;
    
    return {
      total_adjustments: totalAdjustments,
      average_delay_reduction: averageDelayReduction,
      efficiency_improvement: Math.random() * 20 + 10, // 10-30%
      on_time_performance: Math.random() * 20 + 75 // 75-95%
    };
  };

  const applyScheduleUpdate = (updateId: number) => {
    setScheduleUpdates(prev => 
      prev.map(update => 
        update.bus_id === updateId 
          ? { ...update, status: 'applied' as const }
          : update
      )
    );
  };

  const rejectScheduleUpdate = (updateId: number) => {
    setScheduleUpdates(prev => 
      prev.map(update => 
        update.bus_id === updateId 
          ? { ...update, status: 'rejected' as const }
          : update
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Scheduling Engine</h2>
            <p className="text-gray-600">Analyzing schedule optimizations...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = scheduleUpdates.map(update => ({
    bus: `Bus ${update.bus_id}`,
    adjustment: update.adjustment_minutes,
    route: `Route ${update.route_id}`,
    status: update.status
  }));

  const pendingUpdates = scheduleUpdates.filter(update => update.status === 'pending');
  const appliedUpdates = scheduleUpdates.filter(update => update.status === 'applied');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intelligent Scheduling Engine</h2>
          <p className="text-gray-600">AI-powered automatic schedule optimization and adjustments</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="live-data-indicator">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => setIsAutoScheduling(!isAutoScheduling)}
            className={`btn-enhanced flex items-center space-x-2 ${
              isAutoScheduling ? 'btn-primary-enhanced' : 'btn-secondary-enhanced'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>{isAutoScheduling ? 'Auto On' : 'Auto Off'}</span>
          </button>
          <button
            onClick={fetchSchedulingData}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="enhanced-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Adjustments</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_adjustments}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="enhanced-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Delay Reduction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.average_delay_reduction.toFixed(1)}m
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="enhanced-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Improvement</p>
                <p className="text-2xl font-bold text-gray-900">
                  +{metrics.efficiency_improvement.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Route className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="enhanced-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On-Time Performance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.on_time_performance.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule Adjustments Chart */}
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Adjustments</h3>
            <p className="text-sm text-gray-600">
              Recent schedule changes by bus and route
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bus" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} minutes`,
                    name === 'adjustment' ? 'Time Adjustment' : 'Status'
                  ]}
                />
                <Bar dataKey="adjustment" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Performance Trend</h3>
            <p className="text-sm text-gray-600">
              On-time performance over time
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { hour: '06:00', performance: 85 },
                { hour: '08:00', performance: 78 },
                { hour: '10:00', performance: 92 },
                { hour: '12:00', performance: 88 },
                { hour: '14:00', performance: 95 },
                { hour: '16:00', performance: 82 },
                { hour: '18:00', performance: 75 },
                { hour: '20:00', performance: 90 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'Performance %', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'On-Time Performance']} />
                <Line type="monotone" dataKey="performance" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pending Updates */}
      {pendingUpdates.length > 0 && (
        <div className="mt-6">
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">Pending Schedule Updates</h3>
              <p className="text-sm text-gray-600">
                Schedule adjustments awaiting approval
              </p>
            </div>
            
            <div className="space-y-4">
              {pendingUpdates.map((update) => (
                <div key={update.bus_id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Bus className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">Bus {update.bus_id}</span>
                        <span className="text-sm text-gray-500">Route {update.route_id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">From:</span>
                        <span className="font-medium">{update.original_departure}</span>
                        <span className="text-sm text-gray-600">To:</span>
                        <span className="font-medium">{update.new_departure}</span>
                        <span className={`text-sm font-medium ${
                          update.adjustment_minutes > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ({update.adjustment_minutes > 0 ? '+' : ''}{update.adjustment_minutes}m)
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge ${getStatusColor(update.status)}`}>
                        {getStatusIcon(update.status)}
                        <span className="ml-1">{update.status}</span>
                      </span>
                      
                      <button
                        onClick={() => applyScheduleUpdate(update.bus_id)}
                        className="btn btn-primary text-xs px-3 py-1"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => rejectScheduleUpdate(update.bus_id)}
                        className="btn btn-secondary text-xs px-3 py-1"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{update.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Generated: {new Date(update.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Updates */}
      <div className="mt-6">
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Recent Schedule Updates</h3>
            <p className="text-sm text-gray-600">
              All recent schedule adjustments and their status
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scheduleUpdates.map((update, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bus {update.bus_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      Route {update.route_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {update.original_departure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {update.new_departure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        update.adjustment_minutes > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {update.adjustment_minutes > 0 ? '+' : ''}{update.adjustment_minutes}m
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`status-badge ${getStatusColor(update.status)}`}>
                        {getStatusIcon(update.status)}
                        <span className="ml-1">{update.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {update.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
