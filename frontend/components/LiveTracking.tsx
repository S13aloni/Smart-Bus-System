'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Bus, Users, Clock } from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const BusMap = dynamic(() => import('./BusMap'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
});

interface BusData {
  bus_id: number;
  license_plate: string;
  route_id: number;
  route: {
    source: string;
    destination: string;
    stops: string[];
  };
  capacity: number;
  status: string;
  current_position: {
    latitude: number;
    longitude: number;
    speed: number;
    direction: number;
    timestamp: string;
  };
  occupancy: number;
  occupancy_percentage: number;
}

export default function LiveTracking() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null);

  useEffect(() => {
    fetchLiveData();
    // Update every 30 seconds
    const interval = setInterval(fetchLiveData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      const response = await fetch('/api/buses/live');
      const data = await response.json();
      setBuses(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching live data:', error);
      setLoading(false);
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 30) return 'occupancy-low';
    if (percentage < 60) return 'occupancy-medium';
    if (percentage < 90) return 'occupancy-high';
    return 'occupancy-full';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bus-status-active';
      case 'inactive': return 'bus-status-inactive';
      case 'maintenance': return 'bus-status-maintenance';
      default: return 'bus-status-inactive';
    }
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Live Bus Tracking</h2>
          <p className="text-gray-600">Real-time bus locations and occupancy</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="h-96 rounded-lg overflow-hidden border border-gray-200">
            <BusMap 
              buses={buses} 
              selectedBus={selectedBus}
              onBusSelect={setSelectedBus}
            />
          </div>
        </div>

        {/* Bus List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Buses</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {buses.map((bus) => (
              <div
                key={bus.bus_id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedBus?.bus_id === bus.bus_id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBus(bus)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Bus className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-gray-900">{bus.license_plate}</span>
                  </div>
                  <span className={getStatusColor(bus.status)}>
                    {bus.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{bus.route.source} → {bus.route.destination}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {bus.occupancy}/{bus.capacity}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getOccupancyColor(bus.occupancy_percentage)}`}></div>
                      <span className="text-sm font-medium">
                        {bus.occupancy_percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Speed: {Math.round(bus.current_position.speed)} km/h
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Bus Details */}
      {selectedBus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bus Details - {selectedBus.license_plate}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Route Information</h4>
              <p className="text-sm text-gray-600">
                {selectedBus.route.source} → {selectedBus.route.destination}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Stops: {selectedBus.route.stops.length}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Occupancy</h4>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getOccupancyColor(selectedBus.occupancy_percentage)}`}
                    style={{ width: `${selectedBus.occupancy_percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {selectedBus.occupancy_percentage}%
                </span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Current Status</h4>
              <p className="text-sm text-gray-600">
                Speed: {Math.round(selectedBus.current_position.speed)} km/h
              </p>
              <p className="text-sm text-gray-600">
                Direction: {Math.round(selectedBus.current_position.direction)}°
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

