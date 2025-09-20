import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SensorReading, WaterSource } from '@/types/database';
import { BarChart3, GitCompare } from 'lucide-react';

interface SourceComparisonProps {
  sensorReadings: SensorReading[];
  waterSources: WaterSource[];
}

const SourceComparison: React.FC<SourceComparisonProps> = ({ sensorReadings, waterSources }) => {
  const [selectedSources, setSelectedSources] = useState<number[]>([]);

  const handleSourceToggle = (sourceId: number, checked: boolean) => {
    if (checked) {
      setSelectedSources(prev => [...prev, sourceId]);
    } else {
      setSelectedSources(prev => prev.filter(id => id !== sourceId));
    }
  };

  const getLatestReadingForSource = (sourceId: number) => {
    const readings = sensorReadings.filter(r => r.water_source_id === sourceId);
    return readings.length > 0 ? readings[readings.length - 1] : null;
  };

  const getAverageReadingForSource = (sourceId: number) => {
    const readings = sensorReadings.filter(r => r.water_source_id === sourceId);
    if (readings.length === 0) return null;

    return {
      ph_level: readings.reduce((sum, r) => sum + (r.ph_level || 0), 0) / readings.filter(r => r.ph_level).length,
      turbidity: readings.reduce((sum, r) => sum + (r.turbidity || 0), 0) / readings.filter(r => r.turbidity).length,
      temperature: readings.reduce((sum, r) => sum + (r.temperature || 0), 0) / readings.filter(r => r.temperature).length,
      tds_level: readings.reduce((sum, r) => sum + (r.tds_level || 0), 0) / readings.filter(r => r.tds_level).length,
      dissolved_oxygen: readings.reduce((sum, r) => sum + (r.dissolved_oxygen || 0), 0) / readings.filter(r => r.dissolved_oxygen).length,
    };
  };

  const comparisonData = selectedSources.map(sourceId => {
    const source = waterSources.find(s => s.id === sourceId);
    const avgReading = getAverageReadingForSource(sourceId);
    const latestReading = getLatestReadingForSource(sourceId);

    return {
      name: source?.name || `Source ${sourceId}`,
      pH: Number((avgReading?.ph_level || 0).toFixed(1)),
      turbidity: Number((avgReading?.turbidity || 0).toFixed(1)),
      temperature: Number((avgReading?.temperature || 0).toFixed(1)),
      tds: Number((avgReading?.tds_level || 0).toFixed(0)),
      dissolvedOxygen: Number((avgReading?.dissolved_oxygen || 0).toFixed(1)),
      readingCount: sensorReadings.filter(r => r.water_source_id === sourceId).length,
      lastUpdate: latestReading?.created_at
    };
  });

  const selectAll = () => {
    setSelectedSources(waterSources.map(s => s.id));
  };

  const clearAll = () => {
    setSelectedSources([]);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <GitCompare className="h-5 w-5 text-primary" />
          Water Source Comparison
        </CardTitle>
        <CardDescription>
          Compare water quality parameters across multiple sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Source Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Sources to Compare</h3>
              <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {waterSources.map((source) => {
                const readingCount = sensorReadings.filter(r => r.water_source_id === source.id).length;
                const isSelected = selectedSources.includes(source.id);
                
                return (
                  <div key={source.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => handleSourceToggle(source.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <label 
                        htmlFor={`source-${source.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {source.name}
                      </label>
                      <p className="text-xs text-muted-foreground truncate">
                        {source.location} • {readingCount} readings
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison Chart */}
          {selectedSources.length > 0 ? (
            <div className="space-y-6">
              {/* pH Comparison */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  pH Levels Comparison
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[6, 9]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="pH" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TDS Comparison */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  TDS Levels Comparison (ppm)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="tds" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Turbidity Comparison */}
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Turbidity Comparison (NTU)
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar dataKey="turbidity" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Table */}
              <div>
                <h4 className="text-md font-semibold mb-3">Comparison Summary</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border border-border rounded-lg">
                    <thead>
                      <tr className="bg-muted">
                        <th className="border border-border p-2 text-left">Source</th>
                        <th className="border border-border p-2 text-center">pH</th>
                        <th className="border border-border p-2 text-center">TDS (ppm)</th>
                        <th className="border border-border p-2 text-center">Turbidity (NTU)</th>
                        <th className="border border-border p-2 text-center">Temp (°C)</th>
                        <th className="border border-border p-2 text-center">DO (mg/L)</th>
                        <th className="border border-border p-2 text-center">Readings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((data, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="border border-border p-2 font-medium">{data.name}</td>
                          <td className="border border-border p-2 text-center">{data.pH || 'N/A'}</td>
                          <td className="border border-border p-2 text-center">{data.tds || 'N/A'}</td>
                          <td className="border border-border p-2 text-center">{data.turbidity || 'N/A'}</td>
                          <td className="border border-border p-2 text-center">{data.temperature || 'N/A'}</td>
                          <td className="border border-border p-2 text-center">{data.dissolvedOxygen || 'N/A'}</td>
                          <td className="border border-border p-2 text-center">{data.readingCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select water sources to compare their quality parameters</p>
              <p className="text-sm">Choose at least one source from the list above</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SourceComparison;