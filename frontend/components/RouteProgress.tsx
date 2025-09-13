'use client';

import { useState, useEffect } from 'react';
import { Bus, MapPin, Clock, Users, Navigation, Calendar, ArrowRight } from 'lucide-react';
import { enhancedDataService, BusData } from '@/lib/enhancedDataService';

interface RouteProgressProps {
  buses: BusData[];
}

interface BusProgress {
  bus: BusData;
  currentStop: string;
  nextStop: string;
  currentLocation: string;
  locationStatus: string;
  progressPercentage: number;
  timeToNextStop: number;
  isAtStop: boolean;
  distanceToNextStop: number;
  currentStopIndex: number;
  totalStops: number;
  upcomingStops: Array<{
    name: string;
    type: string;
    index: number;
    estimatedTime: number;
  }>;
  currentStationType: string;
}

export default function RouteProgress({ buses }: RouteProgressProps) {
  const [busProgress, setBusProgress] = useState<BusProgress[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    updateBusProgress();
    const interval = setInterval(updateBusProgress, 2000); // Update every 2 seconds
    return () => clearInterval(interval);
  }, [buses]);

  const updateBusProgress = () => {
    const routes = enhancedDataService.getRoutes();
    const progress: BusProgress[] = [];

    buses.forEach(bus => {
      const route = routes.find(r => r.route_id === bus.route_id);
      if (!route) return;

      // Calculate progress along route
      const routeProgress = enhancedDataService.getRouteProgress ? 
        enhancedDataService.getRouteProgress(bus.bus_id) : 
        Math.random() * route.stops_coordinates.length;

      const currentStopIndex = Math.floor(routeProgress);
      const nextStopIndex = Math.min(currentStopIndex + 1, route.stops_coordinates.length - 1);
      
      const currentStop = route.stops_coordinates[currentStopIndex];
      const nextStop = route.stops_coordinates[nextStopIndex];
      
      const segmentProgress = routeProgress - currentStopIndex;
      const progressPercentage = Math.round(segmentProgress * 100);
      
      // Calculate time to next stop (simplified)
      const timeToNextStop = Math.round((1 - segmentProgress) * 5); // 5 minutes max between stops
      
      // Calculate distance to next stop
      const distanceToNextStop = Math.round((1 - segmentProgress) * 2); // 2 km max between stops
      
      // Determine current location description with more realistic progression
      let currentLocation = currentStop.name;
      let locationStatus = '';
      
      if (segmentProgress < 0.1) {
        // At station
        currentLocation = currentStop.name;
        locationStatus = 'reached';
      } else if (segmentProgress >= 0.1 && segmentProgress < 0.3) {
        // Just left station
        currentLocation = `Left ${currentStop.name}`;
        locationStatus = 'departed';
      } else if (segmentProgress >= 0.3 && segmentProgress < 0.7) {
        // Between stations
        currentLocation = `Between ${currentStop.name} and ${nextStop.name}`;
        locationStatus = 'traveling';
      } else if (segmentProgress >= 0.7 && segmentProgress < 0.9) {
        // Approaching next station
        currentLocation = `Approaching ${nextStop.name}`;
        locationStatus = 'approaching';
      } else {
        // Very close to next station
        currentLocation = `Arriving at ${nextStop.name}`;
        locationStatus = 'arriving';
      }

      // Get upcoming stops (next 3-5 stops)
      const upcomingStops = route.stops_coordinates
        .slice(currentStopIndex + 1, Math.min(currentStopIndex + 6, route.stops_coordinates.length))
        .map((stop, index) => ({
          name: stop.name,
          type: stop.type || 'intermediate',
          index: currentStopIndex + index + 2,
          estimatedTime: Math.round((index + 1) * 3 + Math.random() * 2) // 3-5 minutes per stop
        }));

      // Get current station type
      const currentStationType = currentStop.type || 'intermediate';
      
      progress.push({
        bus,
        currentStop: currentStop.name,
        nextStop: nextStop.name,
        currentLocation,
        locationStatus,
        progressPercentage,
        timeToNextStop,
        isAtStop: segmentProgress < 0.1,
        distanceToNextStop,
        currentStopIndex: currentStopIndex + 1,
        totalStops: route.stops_coordinates.length,
        upcomingStops,
        currentStationType
      });
    });

    setBusProgress(progress);
  };

  const getBusImage = (busId: number, isMoving: boolean) => {
    const busImages = [
      '🚌', '🚎', '🚐', '🚍', '🚋', '🚃', '🚞', '🚊', '🚉', '🚈'
    ];
    return busImages[busId % busImages.length];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'maintenance': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage < 30) return 'bg-green-500';
    if (percentage < 60) return 'bg-yellow-500';
    if (percentage < 90) return 'bg-orange-500';
    return 'bg-red-500';
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

  const filteredBuses = selectedRoute 
    ? busProgress.filter(p => p.bus.route_id === selectedRoute)
    : busProgress;

  const routes = enhancedDataService.getRoutes();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Route Progress Tracker</h2>
          <p className="text-gray-600">Real-time bus movement along routes with station tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="live-data-indicator">
            <span>Live Tracking</span>
            <span className="text-xs text-gray-500">
              {filteredBuses.length} buses active
            </span>
          </div>
          <button
            onClick={() => setIsLive(!isLive)}
            className={`btn-enhanced flex items-center space-x-2 ${
              isLive ? 'btn-primary-enhanced' : 'btn-secondary-enhanced'
            }`}
          >
            <Navigation className="h-4 w-4" />
            <span>{isLive ? 'Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Route Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Filter by Route:</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRoute(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                selectedRoute === null 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Routes
            </button>
            {routes.map(route => (
              <button
                key={route.route_id}
                onClick={() => setSelectedRoute(route.route_id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white`}
                style={{ 
                  backgroundColor: selectedRoute === route.route_id ? route.color : '#6B7280',
                  opacity: selectedRoute === route.route_id ? 1 : 0.7
                }}
              >
                Route {route.route_id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bus Progress Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBuses.map((progress) => {
          const delayStatus = getDelayStatus(progress.bus.schedule.delay_minutes);
          const isMoving = !progress.isAtStop && progress.bus.status === 'active';
          
          return (
            <div key={progress.bus.bus_id} className="enhanced-card">
              {/* Bus Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`text-4xl ${isMoving ? 'bus-moving' : 'animate-pulse'}`}>
                    {getBusImage(progress.bus.bus_id, isMoving)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {progress.bus.license_plate}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Route {progress.bus.route_id}
                    </p>
                    {/* Station/Stop Name */}
                    <div className="mt-1">
                      <span className="text-xs text-gray-500">
                        {progress.locationStatus === 'reached' ? 'At:' :
                         progress.locationStatus === 'departed' ? 'Left:' :
                         progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'Arriving:' :
                         'Next:'}
                      </span>
                      <span className={`text-sm font-semibold ml-1 ${
                        progress.locationStatus === 'reached' ? 'text-green-700' :
                        progress.locationStatus === 'departed' ? 'text-yellow-700' :
                        progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-700' :
                        'text-blue-700'
                      }`}>
                        {progress.currentLocation}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getStatusColor(progress.bus.status)}`}>
                    {progress.bus.status}
                  </div>
                  <div className={`text-xs ${delayStatus.color}`}>
                    {delayStatus.label}
                  </div>
                  {/* Movement Status */}
                  <div className="text-xs text-gray-500 mt-1">
                    {progress.locationStatus === 'reached' ? '⏸️ At Station' :
                     progress.locationStatus === 'departed' ? '🚌 Just Departed' :
                     progress.locationStatus === 'approaching' ? '🔔 Approaching' :
                     progress.locationStatus === 'arriving' ? '🚪 Arriving' :
                     '🚌 Moving'}
                  </div>
                </div>
              </div>

              {/* Current Station/Next Stop Display */}
              <div className={`mb-4 p-4 rounded-lg border-l-4 shadow-sm ${
                progress.locationStatus === 'reached' 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                  : progress.locationStatus === 'departed'
                  ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-500'
                  : progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving'
                  ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-500'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500'
              }`}>
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className={`h-5 w-5 ${
                    progress.locationStatus === 'reached' ? 'text-green-600' :
                    progress.locationStatus === 'departed' ? 'text-yellow-600' :
                    progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-600' :
                    'text-blue-600'
                  }`} />
                  <span className={`font-medium ${
                    progress.locationStatus === 'reached' ? 'text-green-900' :
                    progress.locationStatus === 'departed' ? 'text-yellow-900' :
                    progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-900' :
                    'text-blue-900'
                  }`}>
                    {progress.locationStatus === 'reached' ? 'Reached Station' :
                     progress.locationStatus === 'departed' ? 'Departed From' :
                     progress.locationStatus === 'approaching' ? 'Approaching Station' :
                     progress.locationStatus === 'arriving' ? 'Arriving At Station' :
                     'Next Stop'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    progress.currentStationType === 'major' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {progress.currentStationType === 'major' ? 'Major Station' : 'Intermediate Stop'}
                  </span>
                </div>
                
                {/* Station Name Display */}
                <div className="text-center mb-3">
                  <h3 className={`text-lg font-bold mb-1 ${
                    progress.locationStatus === 'reached' ? 'text-green-900' :
                    progress.locationStatus === 'departed' ? 'text-yellow-900' :
                    progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-900' :
                    'text-blue-900'
                  }`}>
                    {progress.currentLocation}
                  </h3>
                  <p className={`text-sm ${
                    progress.locationStatus === 'reached' ? 'text-green-700' :
                    progress.locationStatus === 'departed' ? 'text-yellow-700' :
                    progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-700' :
                    'text-blue-700'
                  }`}>
                    {progress.locationStatus === 'reached' 
                      ? `Station ${progress.currentStopIndex} of ${progress.totalStops} - Stopped`
                      : `Stop ${progress.currentStopIndex + 1} of ${progress.totalStops} - Moving`
                    }
                  </p>
                </div>

                {/* Status Information */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className={`font-medium ${
                      progress.locationStatus === 'reached' ? 'text-green-600' :
                      progress.locationStatus === 'departed' ? 'text-yellow-600' :
                      progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>Status</div>
                    <div className={`font-semibold ${
                      progress.locationStatus === 'reached' ? 'text-green-800' :
                      progress.locationStatus === 'departed' ? 'text-yellow-800' :
                      progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      {progress.locationStatus === 'reached' ? '⏸️ At Station' :
                       progress.locationStatus === 'departed' ? '🚌 Just Departed' :
                       progress.locationStatus === 'approaching' ? '🔔 Approaching' :
                       progress.locationStatus === 'arriving' ? '🚪 Arriving' :
                       '🚌 Moving'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`font-medium ${
                      progress.locationStatus === 'reached' ? 'text-green-600' :
                      progress.locationStatus === 'departed' ? 'text-yellow-600' :
                      progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                      {progress.locationStatus === 'reached' ? 'Time at Station' : 'Time to Next Stop'}
                    </div>
                    <div className={`font-semibold ${
                      progress.locationStatus === 'reached' ? 'text-green-800' :
                      progress.locationStatus === 'departed' ? 'text-yellow-800' :
                      progress.locationStatus === 'approaching' || progress.locationStatus === 'arriving' ? 'text-orange-800' :
                      'text-blue-800'
                    }`}>
                      {progress.locationStatus === 'reached' ? '2-3 min' : `${progress.timeToNextStop} min`}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                {progress.locationStatus !== 'reached' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Coming from: {progress.currentStop}</span>
                      <span>{progress.distanceToNextStop} km to {progress.nextStop}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Upcoming Stations */}
              {progress.upcomingStops.length > 0 && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-l-4 border-green-500 shadow-sm">
                  <div className="flex items-center space-x-2 mb-3">
                    <Navigation className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Upcoming Stations</span>
                  </div>
                  
                  <div className="space-y-2">
                    {progress.upcomingStops.slice(0, 4).map((stop, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-green-700">
                              {stop.index}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{stop.name}</div>
                            <div className="text-xs text-gray-500">
                              {stop.type === 'major' ? 'Major Station' : 'Intermediate Stop'}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-700">
                            ~{stop.estimatedTime} min
                          </div>
                          <div className="text-xs text-gray-500">
                            ETA
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {progress.upcomingStops.length > 4 && (
                    <div className="mt-2 text-center">
                      <span className="text-xs text-green-600">
                        +{progress.upcomingStops.length - 4} more stations
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Route Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Route Progress</span>
                  <span className="text-sm text-gray-600">{progress.progressPercentage}%</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out ${isMoving ? 'progress-pulse' : ''}`}
                    style={{ width: `${progress.progressPercentage}%` }}
                  ></div>
                </div>

                {/* Current and Next Stop */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">{progress.currentStop}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-gray-700">{progress.nextStop}</span>
                  </div>
                </div>
              </div>

              {/* Bus Status */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Occupancy</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {progress.bus.occupancy}/{progress.bus.capacity}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getOccupancyColor(progress.bus.occupancy_percentage)}`}></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {progress.bus.occupancy_percentage}%
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <Navigation className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Speed</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round(progress.bus.current_position.speed)} km/h
                  </div>
                  <div className="text-xs text-gray-500">
                    {isMoving ? 'Moving' : 'At Stop'}
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Next Stop:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {progress.timeToNextStop} min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Navigation className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Distance:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {progress.distanceToNextStop} km
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Delay:</span>
                    </div>
                    <span className={`font-medium ${delayStatus.color}`}>
                      {progress.bus.schedule.delay_minutes > 0 ? '+' : ''}{progress.bus.schedule.delay_minutes} min
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Progress:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {progress.currentStopIndex}/{progress.totalStops}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moving Animation Indicator */}
              {isMoving && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="ml-2 text-xs text-blue-600 font-medium">Moving to next stop</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Route Summary */}
      {selectedRoute && (
        <div className="mt-8">
          <div className="enhanced-card">
            <div className="enhanced-card-header">
              <h3 className="text-lg font-semibold text-gray-900">
                Route {selectedRoute} Summary
              </h3>
              <p className="text-sm text-gray-600">
                {routes.find(r => r.route_id === selectedRoute)?.source} → {routes.find(r => r.route_id === selectedRoute)?.destination}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredBuses.length}
                </div>
                <div className="text-sm text-gray-600">Active Buses</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(filteredBuses.reduce((sum, p) => sum + p.bus.occupancy_percentage, 0) / filteredBuses.length || 0)}%
                </div>
                <div className="text-sm text-gray-600">Avg Occupancy</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredBuses.filter(p => p.bus.schedule.delay_minutes > 5).length}
                </div>
                <div className="text-sm text-gray-600">Delayed Buses</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {filteredBuses.filter(p => p.isAtStop).length}
                </div>
                <div className="text-sm text-gray-600">At Stations</div>
              </div>
            </div>

            {/* Current Station Status */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Current Station Status</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredBuses.map((progress) => (
                  <div key={progress.bus.bus_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getBusImage(progress.bus.bus_id, !progress.isAtStop)}
                      </div>
                    <div>
                      <div className="font-medium text-gray-900">{progress.bus.license_plate}</div>
                      <div className="text-sm text-gray-600">
                        {progress.isAtStop ? 'At Station:' : 'Next Stop:'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-700">
                      {progress.isAtStop ? progress.currentStop : progress.nextStop}
                    </div>
                    <div className="text-xs text-gray-500">
                      {progress.isAtStop ? '⏸️ Stopped' : '🚌 Moving'}
                    </div>
                  </div>
                </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Buses Message */}
      {filteredBuses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Buses Found</h3>
          <p className="text-gray-600">
            {selectedRoute 
              ? `No buses are currently active on Route ${selectedRoute}`
              : 'No buses are currently active'
            }
          </p>
        </div>
      )}
    </div>
  );
}
