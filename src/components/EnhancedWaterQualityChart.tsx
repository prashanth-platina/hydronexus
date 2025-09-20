import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SensorReading, WaterSource } from '@/types/database';
import { TrendingUp, Filter, Calendar } from 'lucide-react';

interface EnhancedWaterQualityChartProps {
  data: SensorReading[];
  waterSources: WaterSource[];
}

const EnhancedWaterQualityChart: React.FC<EnhancedWaterQualityChartProps> = ({ data, waterSources }) => {
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedParameter, setSelectedParameter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Filter data based on selections
  const filteredData = data.filter(reading => {
    const dateMatch = !dateRange.start || !dateRange.end || 
      (new Date(reading.created_at) >= new Date(dateRange.start) && 
       new Date(reading.created_at) <= new Date(dateRange.end));
    
    const sourceMatch = selectedSource === 'all' || 
      reading.water_source_id?.toString() === selectedSource;

    return dateMatch && sourceMatch;
  });

  // Transform data for chart display
  const chartData = filteredData.map((reading, index) => ({
    time: new Date(reading.created_at).toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pH: reading.ph_level,
    turbidity: reading.turbidity,
    temperature: reading.temperature,
    tds: reading.tds_level,
    dissolvedOxygen: reading.dissolved_oxygen,
    chlorine: reading.chlorine_level,
    bacteria: reading.bacterial_count,
    location: reading.location
  })).slice(-20); // Show last 20 readings

  const parameters = [
    { key: 'all', label: 'All Parameters', unit: '' },
    { key: 'pH', label: 'pH Level', unit: '', color: 'hsl(var(--primary))' },
    { key: 'turbidity', label: 'Turbidity', unit: 'NTU', color: 'hsl(var(--secondary))' },
    { key: 'temperature', label: 'Temperature', unit: '°C', color: '#10b981' },
    { key: 'tds', label: 'TDS Level', unit: 'ppm', color: '#f59e0b' },
    { key: 'dissolvedOxygen', label: 'Dissolved Oxygen', unit: 'mg/L', color: '#3b82f6' },
    { key: 'chlorine', label: 'Chlorine', unit: 'mg/L', color: '#8b5cf6' }
  ];

  const getVisibleLines = () => {
    if (selectedParameter === 'all') {
      return parameters.slice(1); // All except 'all'
    }
    return parameters.filter(p => p.key === selectedParameter);
  };

  const clearFilters = () => {
    setSelectedSource('all');
    setSelectedParameter('all');
    setDateRange({ start: '', end: '' });
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Water Quality Trends
        </CardTitle>
        <CardDescription>
          Interactive charts showing water quality parameters over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sourceFilter" className="text-xs">Water Source</Label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {waterSources.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parameterFilter" className="text-xs">Parameter</Label>
              <Select value={selectedParameter} onValueChange={setSelectedParameter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parameters.map((param) => (
                    <SelectItem key={param.key} value={param.key}>
                      {param.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Range
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-36"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-36"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="w-full h-96">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                    formatter={(value: any, name: string) => {
                      const param = parameters.find(p => p.key === name);
                      return [
                        `${value}${param?.unit ? ' ' + param.unit : ''}`,
                        param?.label || name
                      ];
                    }}
                  />
                  <Legend />
                  
                  {getVisibleLines().map((param) => (
                    <Line 
                      key={param.key}
                      type="monotone" 
                      dataKey={param.key} 
                      stroke={param.color}
                      strokeWidth={2}
                      dot={{ fill: param.color, strokeWidth: 2, r: 3 }}
                      name={param.label}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No data available for the selected filters</p>
                  <p className="text-sm">Try adjusting your filter criteria</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Total Readings</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {new Set(filteredData.map(r => r.water_source_id)).size}
              </div>
              <div className="text-sm text-muted-foreground">Sources Monitored</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {filteredData.length > 0 ? 
                  Math.round(filteredData.filter(r => r.ph_level).reduce((sum, r) => sum + (r.ph_level || 0), 0) / filteredData.filter(r => r.ph_level).length * 10) / 10 
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-muted-foreground">Avg pH</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {filteredData.length > 0 ? 
                  Math.round(filteredData.filter(r => r.tds_level).reduce((sum, r) => sum + (r.tds_level || 0), 0) / filteredData.filter(r => r.tds_level).length)
                  : 'N/A'
                }
              </div>
              <div className="text-sm text-muted-foreground">Avg TDS (ppm)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedWaterQualityChart;