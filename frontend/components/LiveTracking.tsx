'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Bus, Users, Clock, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { dataService, BusData } from '@/lib/dataService';

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
      // Use local data service for realistic simulation
      const liveData = dataService.getLiveBusData();
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

  const activeBuses = buses.filter(bus => bus.status === 'active');
  const totalPassengers = buses.reduce((sum, bus) => sum + bus.occupancy, 0);
  const avgOccupancy = buses.length > 0 
    ? Math.round(buses.reduce((sum, bus) => sum + bus.occupancy_percentage, 0) / buses.length)
    : 0;

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
          <p className="text-gray-600">Real-time bus locations and occupancy monitoring</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Buses</p>
              <p className="text-2xl font-bold text-gray-900">{activeBuses.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bus className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{totalPassengers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">{avgOccupancy}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="enhanced-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Update</p>
              <p className="text-sm font-bold text-gray-900">
                {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="enhanced-card p-0 overflow-hidden">
            <div className="h-96">
              <BusMap 
                buses={buses} 
                selectedBus={selectedBus}
                onBusSelect={setSelectedBus}
              />
            </div>
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Active Buses</h3>
            <span className="text-sm text-gray-500">{buses.length} total</span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {buses.map((bus) => (
              <div
                key={bus.bus_id}
                className={`bus-list-item ${
                  selectedBus?.bus_id === bus.bus_id ? 'selected' : ''
                }`}
                onClick={() => setSelectedBus(bus)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getOccupancyColor(bus.occupancy_percentage)}`}></div>
                    <span className="font-medium text-gray-900">{bus.license_plate}</span>
                  </div>
                  <span className={`status-badge ${getStatusColor(bus.status)}`}>
                    {bus.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{bus.route.source} → {bus.route.destination}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {bus.occupancy}/{bus.capacity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {bus.occupancy_percentage}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {getOccupancyLabel(bus.occupancy_percentage)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="occupancy-bar">
                    <div
                      className={`occupancy-fill ${getOccupancyColor(bus.occupancy_percentage)}`}
                      style={{ width: `${bus.occupancy_percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Speed: {Math.round(bus.current_position.speed)} km/h</span>
                    <span>Route {bus.route_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Bus Details */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      {new Date(selectedBus.current_position.timestamp).toLocaleTimeString()}
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
