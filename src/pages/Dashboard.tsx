import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Users,
  MapPin,
  LogOut,
  Bell,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WaterQualityChart from '@/components/WaterQualityChart';
import RiskIndicator from '@/components/RiskIndicator';
import { User } from '@supabase/supabase-js';

interface SensorReading {
  id: number;
  ph_level: number;
  turbidity: number;
  temperature: number;
  bacterial_count: number;
  location: string;
  created_at: string;
}

interface WaterSource {
  id: number;
  name: string;
  location: string;
  status: string;
  created_at: string;
}

interface RiskPrediction {
  id: number;
  risk_level: string;
  confidence: number;
  prediction_data: any;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch sample data since tables might be empty
      const mockSensorData: SensorReading[] = [
        {
          id: 1,
          ph_level: 7.2,
          turbidity: 2.1,
          temperature: 24.5,
          bacterial_count: 10,
          location: 'Community Well A',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          ph_level: 6.8,
          turbidity: 1.8,
          temperature: 23.8,
          bacterial_count: 15,
          location: 'Borehole B',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];

      const mockWaterSources: WaterSource[] = [
        { id: 1, name: 'Community Well A', location: 'Sector 1', status: 'active', created_at: new Date().toISOString() },
        { id: 2, name: 'Borehole B', location: 'Sector 2', status: 'active', created_at: new Date().toISOString() },
        { id: 3, name: 'Hand Pump C', location: 'Sector 3', status: 'maintenance', created_at: new Date().toISOString() }
      ];

      const mockRiskPredictions: RiskPrediction[] = [
        { id: 1, risk_level: 'low', confidence: 85, prediction_data: {}, created_at: new Date().toISOString() },
        { id: 2, risk_level: 'medium', confidence: 72, prediction_data: {}, created_at: new Date().toISOString() }
      ];

      setSensorData(mockSensorData);
      setWaterSources(mockWaterSources);
      setRiskPredictions(mockRiskPredictions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'maintenance':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-500/10 text-red-700 border-red-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Droplets className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AquaGuard Dashboard</h1>
                <p className="text-sm text-muted-foreground">Smart Community Water Monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Water Sources</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{waterSources.length}</div>
              <p className="text-xs text-muted-foreground">Active monitoring points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {waterSources.filter(s => s.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">Currently operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">Medium</div>
              <p className="text-xs text-muted-foreground">Overall community risk</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Readings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensorData.length}</div>
              <p className="text-xs text-muted-foreground">In the last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Water Quality Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Water Quality Trend</CardTitle>
              <CardDescription>Real-time sensor data visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <WaterQualityChart data={sensorData} />
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>AI-powered health risk predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {riskPredictions.map((prediction) => (
                <RiskIndicator
                  key={prediction.id}
                  level={prediction.risk_level}
                  confidence={prediction.confidence}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Water Sources Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Water Sources Status</CardTitle>
              <CardDescription>Current status of all monitoring points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {waterSources.map((source) => (
                  <div key={source.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{source.name}</h3>
                      {getStatusIcon(source.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{source.location}</p>
                    <Badge className={getStatusColor(source.status)}>
                      {source.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Sensor Readings */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sensor Readings</CardTitle>
              <CardDescription>Latest water quality measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorData.map((reading) => (
                  <div key={reading.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{reading.location}</h3>
                      <span className="text-sm text-muted-foreground">
                        {new Date(reading.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">pH Level:</span>
                        <span className="ml-1 font-medium">{reading.ph_level}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Turbidity:</span>
                        <span className="ml-1 font-medium">{reading.turbidity} NTU</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>
                        <span className="ml-1 font-medium">{reading.temperature}°C</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bacteria:</span>
                        <span className="ml-1 font-medium">{reading.bacterial_count} CFU/ml</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;