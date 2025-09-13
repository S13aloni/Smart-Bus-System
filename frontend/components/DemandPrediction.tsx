'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Calendar, Clock, Users, RefreshCw } from 'lucide-react';
import { dataService } from '@/lib/dataService';

interface DemandData {
  hour: number;
  day_of_week: number;
  predicted_passengers: number;
  confidence: number;
  timestamp: string;
}

interface RouteDemand {
  route_id: number;
  period_days: number;
  hourly_demand: Array<{
    hour: number;
    total_passengers: number;
    total_tickets: number;
    avg_passengers_per_ticket: number;
  }>;
  total_passengers: number;
  total_tickets: number;
}

export default function DemandPrediction() {
  const [demandForecast, setDemandForecast] = useState<DemandData[]>([]);
  const [routeDemand, setRouteDemand] = useState<RouteDemand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchDemandData();
  }, []);

  const fetchDemandData = async () => {
    try {
      const forecast = dataService.getDemandForecast();
      const routes = dataService.getRoutes();
      
      setDemandForecast(forecast.forecast || []);
      setRouteDemand(routes.map(route => ({
        route_id: route.route_id,
        period_days: 7,
        hourly_demand: [],
        total_passengers: Math.floor(Math.random() * 1000) + 500,
        total_tickets: Math.floor(Math.random() * 200) + 100,
      })));
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demand data:', error);
      setLoading(false);
    }
  };

  const triggerPrediction = async () => {
    try {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const forecast = dataService.getDemandForecast();
      setDemandForecast(forecast.forecast || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error triggering prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHourLabel = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const chartData = demandForecast.map(item => ({
    hour: getHourLabel(item.hour),
    predicted: item.predicted_passengers,
    confidence: item.confidence * 100,
  }));

  const peakHours = chartData
    .sort((a, b) => b.predicted - a.predicted)
    .slice(0, 5);

  const totalPredicted = chartData.reduce((sum, item) => sum + item.predicted, 0);
  const avgConfidence = chartData.length > 0 
    ? Math.round(chartData.reduce((sum, item) => sum + item.confidence, 0) / chartData.length)
    : 0;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Predictions</h2>
            <p className="text-gray-600">Analyzing demand patterns...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Demand Prediction</h2>
          <p className="text-gray-600">AI-powered passenger demand forecasting</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="live-data-indicator">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
          <button
            onClick={triggerPrediction}
            className="btn-enhanced btn-primary-enhanced flex items-center space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Predicting...' : 'Refresh Prediction'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                24-Hour Demand Forecast
              </h3>
              <p className="text-sm text-gray-600">
                Predicted passenger demand for the next 24 hours
              </p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    label={{ value: 'Passengers', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} passengers`,
                      name === 'predicted' ? 'Predicted Demand' : 'Confidence'
                    ]}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar 
                    dataKey="predicted" 
                    fill="#3B82F6" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Peak Hours & Stats */}
        <div className="space-y-6">
          {/* Peak Hours */}
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            </div>
            <div className="space-y-3">
              {peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-red-500' : 
                      index === 1 ? 'bg-orange-500' : 
                      index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {hour.hour}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {hour.predicted} passengers
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prediction Stats */}
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">Prediction Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Total Predicted</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {totalPredicted.toLocaleString()}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Peak Hour</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {peakHours[0]?.hour || 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Avg Confidence</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {avgConfidence}%
                </span>
              </div>
            </div>
          </div>

          {/* Demand Distribution */}
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">Demand Distribution</h3>
            </div>
            <div className="chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Morning Peak', value: chartData.slice(6, 10).reduce((sum, item) => sum + item.predicted, 0), color: '#EF4444' },
                      { name: 'Daytime', value: chartData.slice(10, 16).reduce((sum, item) => sum + item.predicted, 0), color: '#F59E0B' },
                      { name: 'Evening Peak', value: chartData.slice(17, 21).reduce((sum, item) => sum + item.predicted, 0), color: '#3B82F6' },
                      { name: 'Night', value: chartData.slice(0, 6).concat(chartData.slice(21)).reduce((sum, item) => sum + item.predicted, 0), color: '#6B7280' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Morning Peak', value: 0, color: '#EF4444' },
                      { name: 'Daytime', value: 0, color: '#F59E0B' },
                      { name: 'Evening Peak', value: 0, color: '#3B82F6' },
                      { name: 'Night', value: 0, color: '#6B7280' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} passengers`, 'Demand']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Route Analysis */}
      <div className="mt-6">
        <div className="enhanced-card">
          <div className="enhanced-card-header">
            <h3 className="text-lg font-semibold text-gray-900">Route Analysis</h3>
            <p className="text-sm text-gray-600">
              Select a route to view detailed demand analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routeDemand.map((route) => (
              <div
                key={route.route_id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedRoute === route.route_id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRoute(route.route_id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Route {route.route_id}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {route.total_tickets} tickets
                  </span>
                </div>
                
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Total Passengers: {route.total_passengers.toLocaleString()}</div>
                  <div>Avg per Ticket: {(route.total_passengers / route.total_tickets).toFixed(1)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}