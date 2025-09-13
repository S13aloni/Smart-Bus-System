'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Users, Clock, Navigation, Calendar, AlertTriangle } from 'lucide-react';
import { BusData } from '@/lib/enhancedDataService';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon factory
const createBusIcon = (occupancyPercentage: number, busId: number, isDelayed: boolean) => {
  let className = 'bus-marker';
  if (occupancyPercentage < 30) className += ' low-occupancy';
  else if (occupancyPercentage < 60) className += ' medium-occupancy';
  else if (occupancyPercentage < 90) className += ' high-occupancy';
  else className += ' full-occupancy';

  if (isDelayed) className += ' delayed';

  return L.divIcon({
    className: 'custom-bus-icon',
    html: `
      <div class="${className}">
        <div style="font-size: 12px; font-weight: bold;">${busId}</div>
        ${isDelayed ? '<div style="font-size: 8px;">⚠️</div>' : ''}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface BusMapProps {
  buses: BusData[];
  selectedBus: BusData | null;
  onBusSelect: (bus: BusData) => void;
}

function MapController({ selectedBus, buses }: { selectedBus: BusData | null; buses: BusData[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedBus) {
      map.setView(
        [selectedBus.current_position.latitude, selectedBus.current_position.longitude],
        15
      );
    } else if (buses.length > 0) {
      // Fit map to show all buses
      const group = new L.featureGroup();
      buses.forEach(bus => {
        const marker = L.marker([bus.current_position.latitude, bus.current_position.longitude]);
        group.addLayer(marker);
      });
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds().pad(0.1));
      }
    }
  }, [selectedBus, buses, map]);

  return null;
}

export default function BusMap({ buses, selectedBus, onBusSelect }: BusMapProps) {
  const [mapCenter] = useState([40.7128, -74.0060]); // NYC coordinates
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Ensure map is ready
    const timer = setTimeout(() => setIsMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getDirectionArrow = (direction: number) => {
    const arrows = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖'];
    const index = Math.round(direction / 45) % 8;
    return arrows[index];
  };

  const getDelayStatus = (delayMinutes: number) => {
    if (delayMinutes > 10) return { color: 'text-red-600', label: 'Delayed' };
    if (delayMinutes > 5) return { color: 'text-orange-600', label: 'Slight Delay' };
    if (delayMinutes < -5) return { color: 'text-green-600', label: 'Early' };
    return { color: 'text-green-600', label: 'On Time' };
  };

  if (!isMapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedBus={selectedBus} buses={buses} />
        
        {buses.map((bus) => {
          const isDelayed = bus.schedule.delay_minutes > 5;
          const icon = createBusIcon(bus.occupancy_percentage, bus.bus_id, isDelayed);
          const delayStatus = getDelayStatus(bus.schedule.delay_minutes);
          
          return (
            <Marker
              key={bus.bus_id}
              position={[bus.current_position.latitude, bus.current_position.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onBusSelect(bus),
              }}
            >
              <Popup maxWidth={300} minWidth={250}>
                <div className="p-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Bus className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {bus.license_plate}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Route {bus.route_id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Route Info */}
                    <div className="border-l-4 border-primary-500 pl-3">
                      <p className="text-sm font-medium text-gray-900">
                        {bus.route.source} → {bus.route.destination}
                      </p>
                      <p className="text-xs text-gray-600">
                        {bus.route.stops.length} stops • {bus.route.distance} km
                      </p>
                    </div>
                    
                    {/* Occupancy */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Occupancy</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {bus.occupancy}/{bus.capacity}
                        </span>
                      </div>
                      
                      <div className="occupancy-bar">
                        <div
                          className={`occupancy-fill ${
                            bus.occupancy_percentage < 30 ? 'bg-green-500' :
                            bus.occupancy_percentage < 60 ? 'bg-yellow-500' :
                            bus.occupancy_percentage < 90 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${bus.occupancy_percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Empty</span>
                        <span className="font-medium">{bus.occupancy_percentage}%</span>
                        <span>Full</span>
                      </div>
                    </div>
                    
                    {/* Speed and Direction */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Navigation className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">Speed</p>
                          <p className="text-sm font-medium">
                            {Math.round(bus.current_position.speed)} km/h
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <div className="text-lg">
                          {getDirectionArrow(bus.current_position.direction)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Direction</p>
                          <p className="text-sm font-medium">
                            {Math.round(bus.current_position.direction)}°
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Status */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">Schedule</span>
                        </div>
                        <span className={`text-sm font-medium ${delayStatus.color}`}>
                          {delayStatus.label}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Planned Departure:</span>
                          <span>{formatTime(bus.schedule.planned_departure)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Planned Arrival:</span>
                          <span>{formatTime(bus.schedule.planned_arrival)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delay:</span>
                          <span className={delayStatus.color}>
                            {bus.schedule.delay_minutes > 0 ? '+' : ''}{bus.schedule.delay_minutes} min
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Last Update */}
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>Updated: {formatTime(bus.current_position.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="map-controls">
        <div className="space-y-2">
          <div className="bg-white rounded-lg shadow-sm p-2">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Low (0-30%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Medium (30-60%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs text-gray-600">High (60-90%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Full (90%+)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-yellow-400"></div>
                <span className="text-xs text-gray-600">Delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Live Indicator */}
      <div className="map-overlay">
        <div className="live-data-indicator">
          <span>Live Data</span>
          <span className="text-xs text-gray-500">
            {buses.length} buses active
          </span>
        </div>
      </div>
    </div>
  );
}