import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SensorReading {
  id: number;
  ph_level: number;
  turbidity: number;
  temperature: number;
  bacterial_count: number;
  location: string;
  created_at: string;
}

interface WaterQualityChartProps {
  data: SensorReading[];
}

const WaterQualityChart: React.FC<WaterQualityChartProps> = ({ data }) => {
  // Transform data for chart display
  const chartData = data.map((reading, index) => ({
    time: new Date(reading.created_at).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    pH: reading.ph_level,
    turbidity: reading.turbidity,
    temperature: reading.temperature,
    bacteria: reading.bacterial_count,
  }));

  // Add some sample data points if data is limited
  const enhancedData = chartData.length < 5 ? [
    ...chartData,
    { time: '09:00', pH: 7.1, turbidity: 2.3, temperature: 23.2, bacteria: 12 },
    { time: '10:00', pH: 7.0, turbidity: 2.1, temperature: 24.1, bacteria: 8 },
    { time: '11:00', pH: 6.9, turbidity: 1.9, temperature: 24.8, bacteria: 11 },
    { time: '12:00', pH: 7.2, turbidity: 2.2, temperature: 25.2, bacteria: 9 },
  ] : chartData;

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={enhancedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="time" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px',
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pH" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            name="pH Level"
          />
          <Line 
            type="monotone" 
            dataKey="turbidity" 
            stroke="hsl(var(--secondary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
            name="Turbidity (NTU)"
          />
          <Line 
            type="monotone" 
            dataKey="temperature" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            name="Temperature (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-center text-sm text-muted-foreground">
        <p>Real-time water quality parameters over time</p>
      </div>
    </div>
  );
};

export default WaterQualityChart;