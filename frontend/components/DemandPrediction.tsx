'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Calendar, Clock, Users } from 'lucide-react';

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

  useEffect(() => {
    fetchDemandData();
  }, []);

  const fetchDemandData = async () => {
    try {
      const [forecastResponse, routesResponse] = await Promise.all([
        fetch('/api/demand/forecast'),
        fetch('/api/routes'),
      ]);

      const forecast = await forecastResponse.json();
      const routes = await routesResponse.json();

      setDemandForecast(forecast.forecast || []);
      setRouteDemand(routes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching demand data:', error);
      setLoading(false);
    }
  };

  const triggerPrediction = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/demand/predict', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        setDemandForecast(result.predictions || []);
      }
    } catch (error) {
      console.error('Error triggering prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dayOfWeek];
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner"></div>
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
        <button
          onClick={triggerPrediction}
          className="btn btn-primary flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh Prediction</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
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
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Peak Hours</h3>
            </div>
            <div className="space-y-3">
              {peakHours.map((hour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
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
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Prediction Stats</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Total Predicted</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {chartData.reduce((sum, item) => sum + item.predicted, 0)}
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
                  {Math.round(chartData.reduce((sum, item) => sum + item.confidence, 0) / chartData.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Route Selection */}
      <div className="mt-6">
        <div className="card">
          <div className="card-header">
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
                  <div>Total Passengers: {route.total_passengers}</div>
                  <div>Avg per Ticket: {route.avg_passengers_per_ticket?.toFixed(1) || 'N/A'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

