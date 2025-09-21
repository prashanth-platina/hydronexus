import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { WaterSource, SensorReading } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
  waterSources: WaterSource[];
  sensorReadings: SensorReading[];
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

// Custom markers for risk levels
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

const calculateRiskLevel = (sourceId: number, sensorReadings: SensorReading[]) => {
  const readings = sensorReadings.filter(r => r.water_source_id === sourceId);
  if (readings.length === 0) return 'unknown';

  const latestReading = readings[readings.length - 1];
  const ph = latestReading.ph_level || 7;
  const tds = latestReading.tds_level || 300;

  // Risk thresholds: green for low risk (pH 6.5-8.5 and TDS <500), red for high risk
  if (ph >= 6.5 && ph <= 8.5 && tds < 500) return 'low';
  return 'high';
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return '#10b981'; // green
    case 'high': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ 
  waterSources, 
  sensorReadings, 
  isFullScreen = false,
  onToggleFullScreen 
}) => {
  const [center] = useState<[number, number]>([28.6139, 77.2090]); // India coordinates

  return (
    <Card className={`border-border bg-card ${isFullScreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              Water Sources Map
            </CardTitle>
            <CardDescription>
              Interactive map showing water source locations with risk levels
            </CardDescription>
          </div>
          {onToggleFullScreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullScreen}>
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
              <span>Low Risk (pH 6.5-8.5, TDS &lt;500)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded-full border-2 border-white shadow"></div>
              <span>No Data</span>
            </div>
          </div>
          
          {/* Map */}
          <div className={`rounded-lg border border-border overflow-hidden ${isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
            <MapContainer
              center={center}
              zoom={6}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <MapUpdater center={center} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {waterSources.map((source) => {
                if (!source.latitude || !source.longitude) return null;
                
                const risk = calculateRiskLevel(source.id, sensorReadings);
                const color = getRiskColor(risk);
                const icon = createCustomIcon(color);
                
                // Get latest readings for popup
                const readings = sensorReadings.filter(r => r.water_source_id === source.id);
                const latestReading = readings[readings.length - 1];
                
                return (
                  <Marker
                    key={source.id}
                    position={[source.latitude, source.longitude]}
                    icon={icon}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 max-w-xs">
                        <h3 className="font-semibold text-base mb-1">{source.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">📍 {source.location}</p>
                        <div 
                          className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2"
                          style={{ backgroundColor: color }}
                        >
                          {risk.toUpperCase()} RISK
                        </div>
                        <p className="text-sm mb-1"><strong>Status:</strong> {source.status}</p>
                        {latestReading ? (
                          <div className="text-sm space-y-1">
                            <p><strong>Latest Reading:</strong></p>
                            {latestReading.ph_level && <p>pH: {latestReading.ph_level}</p>}
                            {latestReading.tds_level && <p>TDS: {latestReading.tds_level} ppm</p>}
                            {latestReading.chlorine_level && <p>Chlorine: {latestReading.chlorine_level} ppm</p>}
                            {latestReading.temperature && <p>Temp: {latestReading.temperature}°C</p>}
                            <p className="text-xs text-muted-foreground">
                              {new Date(latestReading.created_at).toLocaleString()}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No recent readings available</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeafletMap;