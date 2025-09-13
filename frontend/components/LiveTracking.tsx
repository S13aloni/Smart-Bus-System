'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Bus, Users, Clock, RefreshCw, Wifi, WifiOff, Calendar } from 'lucide-react';
import { enhancedDataService, BusData } from '@/lib/enhancedDataService';

// Dynamically import the map component to avoid SSR issues
const BusMap = dynamic(() => import('./BusMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

export default function LiveTracking() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial load
    fetchLiveData();
    
    // Set up real-time updates every 5 seconds
    const interval = setInterval(() => {
      if (isLive) {
        fetchLiveData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  const fetchLiveData = async () => {
    try {
      // Use enhanced data service for realistic simulation
      const liveData = enhancedDataService.getLiveBusData();
      setBuses(liveData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live data:', error);
      setLoading(false);
    }
  };

  const toggleLiveUpdates = () => {
    setIsLive(!isLive);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 30) return 'occupancy-low';
    if (percentage < 60) return 'occupancy-medium';
    if (percentage < 90) return 'occupancy-high';
    return 'occupancy-full';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-online';
      case 'inactive': return 'status-offline';
      case 'maintenance': return 'status-warning';
      default: return 'status-offline';
    }
  };

  const getOccupancyLabel = (percentage: number) => {
    if (percentage < 30) return 'Low';
    if (percentage < 60) return 'Medium';
    if (percentage < 90) return 'High';
    return 'Full';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getDelayStatus = (delayMinutes: number) => {
    if (delayMinutes > 10) return { color: 'text-red-600', label: 'Delayed' };
    if (delayMinutes > 5) return { color: 'text-orange-600', label: 'Slight Delay' };
    if (delayMinutes < -5) return { color: 'text-green-600', label: 'Early' };
    return { color: 'text-green-600', label: 'On Time' };
  };

  const activeBuses = buses.filter(bus => bus.status === 'active');
  const totalPassengers = buses.reduce((sum, bus) => sum + bus.occupancy, 0);
  const avgOccupancy = buses.length > 0 
    ? Math.round(buses.reduce((sum, bus) => sum + bus.occupancy_percentage, 0) / buses.length)
    : 0;
  const delayedBuses = buses.filter(bus => bus.schedule.delay_minutes > 5).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Live Data</h2>
            <p className="text-gray-600">Initializing real-time bus tracking...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Bus Tracking</h2>
          <p className="text-gray-600">Real-time bus locations, occupancy, and schedule updates</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="live-data-indicator">
            <span>Live Data</span>
            <span className="text-xs text-gray-500">
              {activeBuses.length} buses active
            </span>
          </div>
          <button
            onClick={toggleLiveUpdates}
            className={`btn-enhanced flex items-center space-x-2 ${
              isLive ? 'btn-primary-enhanced' : 'btn-secondary-enhanced'
            }`}
          >
            {isLive ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </button>
          <button
            onClick={fetchLiveData}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map - Takes up more space */}
        <div className="lg:col-span-3">
          <div className="enhanced-card p-0 overflow-hidden">
            <div className="h-[600px] relative">
              <BusMap 
                buses={buses} 
                selectedBus={selectedBus}
                onBusSelect={setSelectedBus}
              />
              
              {/* Compact Stats Overlay on Map */}
              <div className="absolute top-4 left-4 right-4 map-stats-overlay">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Bus className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Active</p>
                        <p className="text-lg font-bold text-gray-900">{activeBuses.length}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Passengers</p>
                        <p className="text-lg font-bold text-gray-900">{totalPassengers}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <div>
                        <p className="text-xs text-gray-600">Occupancy</p>
                        <p className="text-lg font-bold text-gray-900">{avgOccupancy}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-red-600" />
                      <div>
                        <p className="text-xs text-gray-600">Delayed</p>
                        <p className="text-lg font-bold text-gray-900">{delayedBuses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Bus List */}
        <div className="flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Buses</h3>
            <span className="text-sm text-gray-500">{buses.length}</span>
          </div>
          
          <div className="flex-1 space-y-2 overflow-y-auto">
            {buses.map((bus) => {
              const delayStatus = getDelayStatus(bus.schedule.delay_minutes);
              return (
                <div
                  key={bus.bus_id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedBus?.bus_id === bus.bus_id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedBus(bus)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getOccupancyColor(bus.occupancy_percentage)}`}></div>
                      <span className="font-medium text-sm text-gray-900">{bus.license_plate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        bus.status === 'on_time' ? 'bg-green-100 text-green-800' :
                        bus.status === 'delayed' ? 'bg-orange-100 text-orange-800' :
                        bus.status === 'breakdown' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {bus.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-gray-600 truncate">
                      {bus.route.source} → {bus.route.destination}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {bus.occupancy}/{bus.capacity} ({bus.occupancy_percentage}%)
                      </span>
                      <span className={`text-xs font-medium ${delayStatus.color}`}>
                        {delayStatus.label}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className={`h-1 rounded-full ${
                          bus.occupancy_percentage < 30 ? 'bg-green-500' :
                          bus.occupancy_percentage < 60 ? 'bg-yellow-500' :
                          bus.occupancy_percentage < 90 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${bus.occupancy_percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round(bus.current_position.speed)} km/h</span>
                      <span>{bus.schedule.delay_minutes > 0 ? '+' : ''}{bus.schedule.delay_minutes}m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Selected Bus Details */}
      {selectedBus && (
        <div className="mt-6">
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Bus Details - {selectedBus.license_plate}
              </h3>
              <p className="text-sm text-gray-600">
                Route {selectedBus.route_id} • {selectedBus.route.source} → {selectedBus.route.destination}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Route Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Distance:</span>
                    <span className="text-sm font-medium">{selectedBus.route.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stops:</span>
                    <span className="text-sm font-medium">{selectedBus.route.stops.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{selectedBus.capacity} passengers</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Current Occupancy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Passengers:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {selectedBus.occupancy}/{selectedBus.capacity}
                    </span>
                  </div>
                  <div className="occupancy-bar">
                    <div
                      className={`occupancy-fill ${getOccupancyColor(selectedBus.occupancy_percentage)}`}
                      style={{ width: `${selectedBus.occupancy_percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Empty</span>
                    <span className="font-medium">{selectedBus.occupancy_percentage}%</span>
                    <span>Full</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Current Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Speed:</span>
                    <span className="text-sm font-medium">
                      {Math.round(selectedBus.current_position.speed)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Direction:</span>
                    <span className="text-sm font-medium">
                      {Math.round(selectedBus.current_position.direction)}°
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Update:</span>
                    <span className="text-sm font-medium">
                      {formatTime(selectedBus.current_position.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-3">Schedule Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Planned Departure:</span>
                    <span className="text-sm font-medium">
                      {formatTime(selectedBus.schedule.planned_departure)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Planned Arrival:</span>
                    <span className="text-sm font-medium">
                      {formatTime(selectedBus.schedule.planned_arrival)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Delay:</span>
                    <span className={`text-sm font-medium ${getDelayStatus(selectedBus.schedule.delay_minutes).color}`}>
                      {selectedBus.schedule.delay_minutes > 0 ? '+' : ''}{selectedBus.schedule.delay_minutes} min
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}