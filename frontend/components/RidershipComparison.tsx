'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Target, Users, Clock, RefreshCw } from 'lucide-react';
import { enhancedDataService, PredictionData } from '@/lib/enhancedDataService';

interface RidershipData extends PredictionData {
  actual_ridership?: number;
  accuracy?: number;
}

export default function RidershipComparison() {
  const [ridershipData, setRidershipData] = useState<RidershipData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchRidershipData();
    const interval = setInterval(fetchRidershipData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRidershipData = async () => {
    try {
      const data = enhancedDataService.getRidershipComparison();
      setRidershipData(data);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ridership data:', error);
      setLoading(false);
    }
  };

  const getRouteData = () => {
    if (selectedRoute) {
      return ridershipData.filter(item => item.route_id === selectedRoute);
    }
    return ridershipData;
  };

  const getChartData = () => {
    const data = getRouteData();
    const chartData = data.map(item => ({
      route: `Route ${item.route_id}`,
      predicted: item.predicted_ridership,
      actual: item.actual_ridership || 0,
      accuracy: item.accuracy ? (1 - item.accuracy) * 100 : 0,
      hour: `${item.hour}:00`,
      confidence: item.confidence * 100
    }));

    return chartData;
  };

  const getAccuracyStats = () => {
    const data = getRouteData();
    if (data.length === 0) return { avgAccuracy: 0, totalPredictions: 0, totalActual: 0 };

    const validData = data.filter(item => item.actual_ridership && item.actual_ridership > 0);
    const avgAccuracy = validData.length > 0 
      ? validData.reduce((sum, item) => sum + (item.accuracy || 0), 0) / validData.length
      : 0;
    
    const totalPredictions = data.reduce((sum, item) => sum + item.predicted_ridership, 0);
    const totalActual = data.reduce((sum, item) => sum + (item.actual_ridership || 0), 0);

    return {
      avgAccuracy: (1 - avgAccuracy) * 100,
      totalPredictions,
      totalActual,
      validPredictions: validData.length
    };
  };

  const getRouteOptions = () => {
    const routes = [...new Set(ridershipData.map(item => item.route_id))];
    return routes.map(routeId => ({
      value: routeId,
      label: `Route ${routeId}`
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Ridership Data</h2>
            <p className="text-gray-600">Analyzing prediction accuracy...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const stats = getAccuracyStats();
  const routeOptions = getRouteOptions();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ridership Prediction Analysis</h2>
          <p className="text-gray-600">Forecasted vs Actual ridership comparison</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="live-data-indicator">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={fetchRidershipData}
            className="btn-enhanced btn-primary-enhanced flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Route Selection */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Route:</label>
          <select
            value={selectedRoute || ''}
            onChange={(e) => setSelectedRoute(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Routes</option>
            {routeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prediction Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgAccuracy.toFixed(1)}%
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Predicted</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalPredictions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Actual</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalActual.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valid Predictions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.validPredictions}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction vs Actual Chart */}
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Predicted vs Actual Ridership</h3>
            <p className="text-sm text-gray-600">
              Comparison of forecasted and actual passenger counts
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" />
                <YAxis label={{ value: 'Passengers', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value} passengers`,
                    name === 'predicted' ? 'Predicted' : 
                    name === 'actual' ? 'Actual' : 'Accuracy'
                  ]}
                />
                <Bar dataKey="predicted" fill="#3B82F6" name="predicted" />
                <Bar dataKey="actual" fill="#10B981" name="actual" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Trend Chart */}
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Prediction Accuracy Trend</h3>
            <p className="text-sm text-gray-600">
              Accuracy percentage over time
            </p>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Accuracy']}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Comparison Table */}
      <div className="mt-6">
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Prediction Analysis</h3>
            <p className="text-sm text-gray-600">
              Hour-by-hour comparison of predictions and actual ridership
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predicted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.map((item, index) => {
                  const difference = item.actual - item.predicted;
                  const isOverPredicted = difference < 0;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.hour}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.predicted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.actual}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverPredicted 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {isOverPredicted ? '' : '+'}{difference}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.accuracy.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.confidence.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
