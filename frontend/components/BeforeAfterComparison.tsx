'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ArrowUp, ArrowDown, Clock, Bus, TrendingUp, AlertCircle } from 'lucide-react';

interface ScheduleData {
  bus_id: number;
  route_id: number;
  start_time: string;
  end_time: string;
  adjustment_reason: string;
  original_start_time?: string;
  time_adjustment_minutes?: number;
}

interface ComparisonMetrics {
  total_buses: {
    current: number;
    optimized: number;
    change: number;
  };
  average_headway_minutes: {
    current: number;
    optimized: number;
    improvement: number;
  };
  efficiency_score: {
    current: number;
    optimized: number;
  };
}

export default function BeforeAfterComparison() {
  const [currentSchedules, setCurrentSchedules] = useState<ScheduleData[]>([]);
  const [optimizedSchedules, setOptimizedSchedules] = useState<ScheduleData[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const fetchScheduleData = async () => {
    try {
      const response = await fetch('/api/schedule/comparison');
      const data = await response.json();
      
      setCurrentSchedules(data.current_schedules || []);
      setOptimizedSchedules(data.optimized_schedules || []);
      setComparisonMetrics(data.comparison_metrics || null);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
      setLoading(false);
    }
  };

  const getTimeLabel = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const calculateHeadwayData = (schedules: ScheduleData[]) => {
    const headways = [];
    for (let i = 1; i < schedules.length; i++) {
      const prevTime = timeToMinutes(schedules[i-1].start_time);
      const currTime = timeToMinutes(schedules[i].start_time);
      headways.push({
        bus: `Bus ${schedules[i].bus_id}`,
        headway: currTime - prevTime,
      });
    }
    return headways;
  };

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getImprovementIcon = (current: number, optimized: number) => {
    if (optimized > current) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    } else if (optimized < current) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return <span className="h-4 w-4 text-gray-500">—</span>;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const currentHeadways = calculateHeadwayData(currentSchedules);
  const optimizedHeadways = calculateHeadwayData(optimizedSchedules);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Before vs After Optimization</h2>
          <p className="text-gray-600">Compare current and optimized bus schedules</p>
        </div>
        <button
          onClick={fetchScheduleData}
          className="btn btn-primary flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Overview */}
      {comparisonMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Total Buses</h3>
              {getImprovementIcon(comparisonMetrics.total_buses.current, comparisonMetrics.total_buses.optimized)}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {comparisonMetrics.total_buses.current}
                </div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {comparisonMetrics.total_buses.optimized}
                </div>
                <div className="text-sm text-gray-600">Optimized</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Avg Headway</h3>
              {getImprovementIcon(comparisonMetrics.average_headway_minutes.current, comparisonMetrics.average_headway_minutes.optimized)}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {comparisonMetrics.average_headway_minutes.current.toFixed(1)}m
                </div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {comparisonMetrics.average_headway_minutes.optimized.toFixed(1)}m
                </div>
                <div className="text-sm text-gray-600">Optimized</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Efficiency Score</h3>
              {getImprovementIcon(comparisonMetrics.efficiency_score.current, comparisonMetrics.efficiency_score.optimized)}
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: getEfficiencyColor(comparisonMetrics.efficiency_score.current) }}
                >
                  {comparisonMetrics.efficiency_score.current.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-2xl font-bold"
                  style={{ color: getEfficiencyColor(comparisonMetrics.efficiency_score.optimized) }}
                >
                  {comparisonMetrics.efficiency_score.optimized.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Optimized</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Headway Comparison Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Headway Comparison</h3>
            <p className="text-sm text-gray-600">
              Time between consecutive buses (lower is better)
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Current', headway: comparisonMetrics?.average_headway_minutes.current || 0 },
                { name: 'Optimized', headway: comparisonMetrics?.average_headway_minutes.optimized || 0 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} minutes`, 'Headway']} />
                <Bar dataKey="headway" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Score Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Efficiency Scores</h3>
            <p className="text-sm text-gray-600">
              Overall schedule efficiency (higher is better)
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Current', value: comparisonMetrics?.efficiency_score.current || 0, color: '#EF4444' },
                    { name: 'Optimized', value: comparisonMetrics?.efficiency_score.optimized || 0, color: '#10B981' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Current', value: comparisonMetrics?.efficiency_score.current || 0, color: '#EF4444' },
                    { name: 'Optimized', value: comparisonMetrics?.efficiency_score.optimized || 0, color: '#10B981' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} points`, 'Efficiency']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Schedule Details */}
      <div className="mt-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Schedule Adjustments</h3>
            <p className="text-sm text-gray-600">
              Detailed view of schedule changes and optimization reasons
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Original Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Optimized Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {optimizedSchedules.map((schedule, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Bus {schedule.bus_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getTimeLabel(schedule.original_start_time || schedule.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTimeLabel(schedule.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {schedule.time_adjustment_minutes ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          schedule.time_adjustment_minutes > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {schedule.time_adjustment_minutes > 0 ? '+' : ''}
                          {schedule.time_adjustment_minutes} min
                        </span>
                      ) : (
                        <span className="text-gray-400">No change</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {schedule.adjustment_reason}
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

