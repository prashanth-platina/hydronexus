import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { WaterSource, SensorReading } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, AlertTriangle, Info } from 'lucide-react';

interface WaterMapProps {
  waterSources: WaterSource[];
  sensorReadings: SensorReading[];
}

const WaterMap: React.FC<WaterMapProps> = ({ waterSources, sensorReadings }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenSet, setTokenSet] = useState(false);

  // Calculate risk level based on pH and TDS
  const calculateRiskLevel = (sourceId: number) => {
    const readings = sensorReadings.filter(r => r.water_source_id === sourceId);
    if (readings.length === 0) return 'unknown';

    const latestReading = readings[readings.length - 1];
    const ph = latestReading.ph_level || 7;
    const tds = latestReading.tds_level || 300;

    // Risk thresholds
    if (ph < 6.5 || ph > 8.5 || tds > 1000) return 'high';
    if (ph < 7 || ph > 8 || tds > 500) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [36.8219, -1.2921], // Nairobi, Kenya
      zoom: 10
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      addWaterSourceMarkers();
    });
  };

  const addWaterSourceMarkers = () => {
    if (!map.current) return;

    waterSources.forEach((source) => {
      if (!source.latitude || !source.longitude) return;

      const risk = calculateRiskLevel(source.id);
      const color = getRiskColor(risk);

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'water-source-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
      `;

      // Get latest readings for popup
      const readings = sensorReadings.filter(r => r.water_source_id === source.id);
      const latestReading = readings[readings.length - 1];

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">
            ${source.name}
          </h3>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            📍 ${source.location}
          </p>
          <div style="background: ${color}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; text-transform: uppercase; margin-bottom: 8px;">
            ${risk} Risk
          </div>
          ${latestReading ? `
            <div style="font-size: 14px; line-height: 1.4;">
              <strong>Latest Reading:</strong><br>
              ${latestReading.ph_level ? `pH: ${latestReading.ph_level}<br>` : ''}
              ${latestReading.tds_level ? `TDS: ${latestReading.tds_level} ppm<br>` : ''}
              ${latestReading.temperature ? `Temp: ${latestReading.temperature}°C<br>` : ''}
              ${latestReading.turbidity ? `Turbidity: ${latestReading.turbidity} NTU<br>` : ''}
              <small style="color: #6b7280;">
                ${new Date(latestReading.created_at).toLocaleString()}
              </small>
            </div>
          ` : '<div style="color: #6b7280; font-size: 14px;">No recent readings available</div>'}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(popupContent);

      new mapboxgl.Marker(markerElement)
        .setLngLat([source.longitude, source.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  useEffect(() => {
    if (tokenSet && mapboxToken) {
      initializeMap();
    }

    return () => {
      map.current?.remove();
    };
  }, [tokenSet, mapboxToken]);

  if (!tokenSet) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <MapPin className="h-5 w-5 text-primary" />
            Water Sources Map
          </CardTitle>
          <CardDescription>
            To display the interactive map, please enter your Mapbox public token
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">How to get your Mapbox token:</p>
              <ol className="mt-2 space-y-1 list-decimal list-inside">
                <li>Visit <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a></li>
                <li>Create a free account or sign in</li>
                <li>Go to your Account → Tokens section</li>
                <li>Copy your "Default public token"</li>
              </ol>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mapboxToken">Mapbox Public Token</Label>
            <Input
              id="mapboxToken"
              type="password"
              placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJ..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => setTokenSet(true)}
            disabled={!mapboxToken.trim()}
            className="w-full"
          >
            Initialize Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          Water Sources Map
        </CardTitle>
        <CardDescription>
          Interactive map showing water source locations with risk levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow"></div>
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
              <span>Medium Risk</span>
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
          
          <div 
            ref={mapContainer} 
            className="w-full h-96 rounded-lg border border-border" 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default WaterMap;