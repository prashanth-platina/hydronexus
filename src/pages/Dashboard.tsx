import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SensorReading, WaterSource, RiskPrediction, CommunityReport, AlertLog } from "@/types/database";
import ManualDataEntry from "@/components/ManualDataEntry";
import CommunityReportForm from "@/components/CommunityReportForm";
import LeafletMap from "@/components/LeafletMap";
import AIWaterAnalysis from "@/components/AIWaterAnalysis";
import ProfileDropdown from "@/components/ProfileDropdown";
import EnhancedWaterQualityChart from "@/components/EnhancedWaterQualityChart";
import SourceComparison from "@/components/SourceComparison";
import HistoricalData from "@/components/HistoricalData";
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
  Settings,
  Plus,
  BarChart3,
  Map,
  Filter
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import WaterQualityChart from '@/components/WaterQualityChart';
import RiskIndicator from '@/components/RiskIndicator';
import { User } from '@supabase/supabase-js';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([]);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'charts' | 'map'>('charts');
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
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
      setupRealtimeSubscriptions();
    }
  }, [user]);

  const setupRealtimeSubscriptions = () => {
    const sensorChannel = supabase
      .channel('sensor-readings-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sensor_readings' },
        (payload) => {
          setSensorReadings(prev => [payload.new as SensorReading, ...prev].slice(0, 100));
          toast({ title: "New Reading", description: `New data at ${(payload.new as SensorReading).location}` });
        }
      )
      .subscribe();
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sensorsResponse, sourcesResponse, risksResponse, reportsResponse] = await Promise.all([
        supabase.from('sensor_readings').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('water_sources').select('*').order('name'),
        supabase.from('risk_predictions').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('cummunity_reports').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      if (sensorsResponse.error) throw sensorsResponse.error;
      if (sourcesResponse.error) throw sourcesResponse.error;
      if (risksResponse.error) throw risksResponse.error;
      if (reportsResponse.error) throw reportsResponse.error;

      setSensorReadings(sensorsResponse.data || []);
      setWaterSources(sourcesResponse.data || []);
      setRiskPredictions(risksResponse.data || []);
      setCommunityReports(reportsResponse.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const filteredSensorReadings = selectedSourceFilter === 'all' 
    ? sensorReadings 
    : sensorReadings.filter(reading => reading.water_source_id?.toString() === selectedSourceFilter);

  const totalSources = waterSources.length;
  const activeSources = waterSources.filter(source => source.status === 'active').length;
  const recentReadings = filteredSensorReadings.slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Droplets className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Droplets className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">AquaGuard Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedSourceFilter} onValueChange={setSelectedSourceFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by source" />
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
              
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <ProfileDropdown user={user!} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
                <Droplets className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSources}</div>
                <p className="text-xs text-muted-foreground">Water monitoring points</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSources}</div>
                <p className="text-xs text-muted-foreground">Currently operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Community Reports</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communityReports.length}</div>
                <p className="text-xs text-muted-foreground">Recent reports</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Readings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentReadings.length}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
              <TabsTrigger value="historical">Historical</TabsTrigger>
              <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Real-time Data View</CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant={currentView === 'charts' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setCurrentView('charts')}
                        >
                          <BarChart3 className="h-4 w-4 mr-1" />
                          Charts
                        </Button>
                        <Button 
                          variant={currentView === 'map' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setCurrentView('map')}
                        >
                          <Map className="h-4 w-4 mr-1" />
                          Map
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentView === 'charts' ? (
                      <WaterQualityChart data={sensorReadings} />
                    ) : (
                      <LeafletMap 
                        waterSources={waterSources} 
                        sensorReadings={sensorReadings}
                        isFullScreen={isMapFullScreen}
                        onToggleFullScreen={() => setIsMapFullScreen(!isMapFullScreen)}
                      />
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Predictions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {riskPredictions.slice(0, 3).map((prediction) => (
                        <RiskIndicator
                          key={prediction.id}
                          level={prediction.risk_level}
                          confidence={prediction.confidence || 0}
                          title={`Prediction #${prediction.id}`}
                        />
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Community Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {communityReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{report.reported_by}</p>
                            <p className="text-xs text-muted-foreground">{report.report_description}</p>
                            <Badge variant="outline" className="mt-1">
                              {report.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <EnhancedWaterQualityChart data={sensorReadings} waterSources={waterSources} />
            </TabsContent>

            <TabsContent value="map">
              <LeafletMap 
                waterSources={waterSources} 
                sensorReadings={sensorReadings}
                isFullScreen={isMapFullScreen}
                onToggleFullScreen={() => setIsMapFullScreen(!isMapFullScreen)}
              />
            </TabsContent>

            <TabsContent value="comparison">
              <SourceComparison sensorReadings={sensorReadings} waterSources={waterSources} />
            </TabsContent>

            <TabsContent value="historical">
              <HistoricalData sensorReadings={sensorReadings} waterSources={waterSources} />
            </TabsContent>

            <TabsContent value="ai-analysis">
              <AIWaterAnalysis sensorReadings={sensorReadings} />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ManualDataEntry onDataSubmitted={fetchDashboardData} />
                <CommunityReportForm onReportSubmitted={fetchDashboardData} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;