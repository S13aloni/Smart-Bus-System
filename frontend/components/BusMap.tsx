'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Users, Clock } from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const createBusIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-bus-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      ">
        🚌
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

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

interface BusMapProps {
  buses: BusData[];
  selectedBus: BusData | null;
  onBusSelect: (bus: BusData) => void;
}

function MapController({ selectedBus }: { selectedBus: BusData | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedBus) {
      map.setView(
        [selectedBus.current_position.latitude, selectedBus.current_position.longitude],
        15
      );
    }
  }, [selectedBus, map]);

  return null;
}

export default function BusMap({ buses, selectedBus, onBusSelect }: BusMapProps) {
  const [mapCenter] = useState([40.7128, -74.0060]); // Default to NYC coordinates

  const getBusColor = (occupancyPercentage: number) => {
    if (occupancyPercentage < 30) return '#10B981'; // green
    if (occupancyPercentage < 60) return '#F59E0B'; // yellow
    if (occupancyPercentage < 90) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedBus={selectedBus} />
        
        {buses.map((bus) => {
          const color = getBusColor(bus.occupancy_percentage);
          const icon = createBusIcon(color);
          
          return (
            <Marker
              key={bus.bus_id}
              position={[bus.current_position.latitude, bus.current_position.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onBusSelect(bus),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bus className="h-4 w-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">
                      {bus.license_plate}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">
                        {bus.route.source} → {bus.route.destination}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="h-3 w-3 text-gray-600" />
                      <span className="text-gray-600">
                        {bus.occupancy}/{bus.capacity} passengers
                      </span>
                      <span className="font-medium">
                        ({bus.occupancy_percentage}%)
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-600" />
                      <span className="text-gray-600">
                        Speed: {Math.round(bus.current_position.speed)} km/h
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Last updated: {formatTime(bus.current_position.timestamp)}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${bus.occupancy_percentage}%`,
                            backgroundColor: color,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

