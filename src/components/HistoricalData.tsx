import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SensorReading, WaterSource } from '@/types/database';
import { History, Download, Filter, Calendar, MapPin } from 'lucide-react';

interface HistoricalDataProps {
  sensorReadings: SensorReading[];
  waterSources: WaterSource[];
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ sensorReadings, waterSources }) => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = [...sensorReadings];

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(reading => {
        const readingDate = new Date(reading.created_at);
        return readingDate >= new Date(dateRange.start) && readingDate <= new Date(dateRange.end);
      });
    }

    // Filter by water source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(reading => reading.water_source_id?.toString() === selectedSource);
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      if (sortBy === 'created_at') {
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
      } else {
        aValue = a[sortBy as keyof SensorReading] || 0;
        bValue = b[sortBy as keyof SensorReading] || 0;
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : 1;
      } else {
        return aValue < bValue ? -1 : 1;
      }
    });

    return filtered;
  }, [sensorReadings, dateRange, selectedSource, sortBy, sortOrder]);

  const getSourceName = (sourceId: number | null) => {
    if (!sourceId) return 'Unknown Source';
    const source = waterSources.find(s => s.id === sourceId);
    return source?.name || `Source ${sourceId}`;
  };

  const getRiskLevel = (reading: SensorReading) => {
    const ph = reading.ph_level || 7;
    const tds = reading.tds_level || 300;
    
    if (ph < 6.5 || ph > 8.5 || tds > 1000) return 'high';
    if (ph < 7 || ph > 8 || tds > 500) return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedSource('all');
    setSortBy('created_at');
    setSortOrder('desc');
  };

  const exportToCSV = () => {
    const headers = [
      'Date & Time',
      'Water Source',
      'Location',
      'pH Level',
      'Turbidity (NTU)',
      'Temperature (°C)',
      'Bacterial Count (CFU/ml)',
      'TDS (ppm)',
      'Dissolved Oxygen (mg/L)',
      'Chlorine (mg/L)',
      'Risk Level'
    ];

    const csvData = filteredAndSortedData.map(reading => [
      new Date(reading.created_at).toLocaleString(),
      getSourceName(reading.water_source_id),
      reading.location,
      reading.ph_level || 'N/A',
      reading.turbidity || 'N/A',
      reading.temperature || 'N/A',
      reading.bacterial_count || 'N/A',
      reading.tds_level || 'N/A',
      reading.dissolved_oxygen || 'N/A',
      reading.chlorine_level || 'N/A',
      getRiskLevel(reading)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `water_quality_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <History className="h-5 w-5 text-primary" />
          Historical Water Quality Data
        </CardTitle>
        <CardDescription>
          Browse and analyze past water quality readings with filtering and export options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters & Controls:</span>
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

            <div className="space-y-2">
              <Label className="text-xs">Water Source</Label>
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
              <Label className="text-xs">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="ph_level">pH Level</SelectItem>
                  <SelectItem value="tds_level">TDS Level</SelectItem>
                  <SelectItem value="turbidity">Turbidity</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Order</Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Total Records:</span>
              <Badge variant="outline">{filteredAndSortedData.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Date Range:</span>
              <Badge variant="outline">
                {filteredAndSortedData.length > 0 
                  ? `${new Date(filteredAndSortedData[filteredAndSortedData.length - 1].created_at).toLocaleDateString()} - ${new Date(filteredAndSortedData[0].created_at).toLocaleDateString()}`
                  : 'No data'
                }
              </Badge>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            {filteredAndSortedData.length > 0 ? (
              <table className="w-full text-sm border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-2 text-left">Date & Time</th>
                    <th className="border border-border p-2 text-left">Source</th>
                    <th className="border border-border p-2 text-left">Location</th>
                    <th className="border border-border p-2 text-center">pH</th>
                    <th className="border border-border p-2 text-center">TDS (ppm)</th>
                    <th className="border border-border p-2 text-center">Turbidity</th>
                    <th className="border border-border p-2 text-center">Temp (°C)</th>
                    <th className="border border-border p-2 text-center">Bacteria</th>
                    <th className="border border-border p-2 text-center">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map((reading, index) => {
                    const risk = getRiskLevel(reading);
                    return (
                      <tr key={reading.id} className="hover:bg-muted/50">
                        <td className="border border-border p-2">
                          {new Date(reading.created_at).toLocaleString()}
                        </td>
                        <td className="border border-border p-2">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {getSourceName(reading.water_source_id)}
                          </div>
                        </td>
                        <td className="border border-border p-2 text-xs text-muted-foreground">
                          {reading.location}
                        </td>
                        <td className="border border-border p-2 text-center">
                          {reading.ph_level?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="border border-border p-2 text-center">
                          {reading.tds_level || 'N/A'}
                        </td>
                        <td className="border border-border p-2 text-center">
                          {reading.turbidity?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="border border-border p-2 text-center">
                          {reading.temperature?.toFixed(1) || 'N/A'}
                        </td>
                        <td className="border border-border p-2 text-center">
                          {reading.bacterial_count || 'N/A'}
                        </td>
                        <td className="border border-border p-2 text-center">
                          <Badge variant={getRiskColor(risk) as any} className="text-xs">
                            {risk.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No historical data found</p>
                <p className="text-sm">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HistoricalData;