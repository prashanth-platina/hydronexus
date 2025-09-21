import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SensorReading } from '@/types/database';
import { Brain, AlertTriangle, Shield, Languages, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AIWaterAnalysisProps {
  sensorReadings: SensorReading[];
}

interface AIAnalysis {
  causes_en: string;
  precautions_en: string;
  causes_te: string;
  precautions_te: string;
  risk_level: 'low' | 'medium' | 'high';
}

const AIWaterAnalysis: React.FC<AIWaterAnalysisProps> = ({ sensorReadings }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'te'>('en');

  const getLatestReading = () => {
    return sensorReadings.length > 0 ? sensorReadings[0] : null;
  };

  const analyzeWaterQuality = async () => {
    const latestReading = getLatestReading();
    if (!latestReading) {
      toast({
        title: "No Data",
        description: "No sensor readings available for analysis.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('water-quality-ai-analysis', {
        body: {
          reading: latestReading
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated successfully."
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when new readings arrive
  useEffect(() => {
    if (sensorReadings.length > 0) {
      analyzeWaterQuality();
    }
  }, [sensorReadings.length]);

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const latestReading = getLatestReading();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Brain className="h-5 w-5 text-primary" />
              AI Water Quality Analysis
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations for water safety
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={language === 'te' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLanguage('te')}
            >
              తెలుగు
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Latest Reading Summary */}
          {latestReading && (
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Current Reading Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {latestReading.ph_level && <span>pH: {latestReading.ph_level}</span>}
                {latestReading.tds_level && <span>TDS: {latestReading.tds_level} ppm</span>}
                {latestReading.turbidity && <span>Turbidity: {latestReading.turbidity} NTU</span>}
                {latestReading.temperature && <span>Temp: {latestReading.temperature}°C</span>}
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Analyzing water quality...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {/* Risk Level */}
              <div className="flex items-center gap-2">
                <span className="font-semibold">Risk Level:</span>
                <Badge className={`${getRiskBadgeColor(analysis.risk_level)} text-white`}>
                  {analysis.risk_level.toUpperCase()}
                </Badge>
              </div>

              {/* Causes Analysis */}
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h3 className="font-semibold">
                    {language === 'en' ? 'Potential Causes' : 'సంభావ్య కారణాలు'}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed">
                  {language === 'en' ? analysis.causes_en : analysis.causes_te}
                </p>
              </div>

              {/* Precautions - Always Visible */}
              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-primary">
                    {language === 'en' ? 'Recommended Precautions' : 'సిఫార్సు చేయబడిన జాగ్రత్తలు'}
                  </h3>
                </div>
                <div className="text-sm leading-relaxed font-medium">
                  {language === 'en' ? analysis.precautions_en : analysis.precautions_te}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'AI analysis will appear here when sensor data is available.'
                  : 'సెన్సార్ డేటా అందుబాటులో ఉన్నప్పుడు AI విశ్లేషణ ఇక్కడ కనిపిస్తుంది.'}
              </p>
              <Button onClick={analyzeWaterQuality} disabled={!latestReading}>
                <Languages className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Generate Analysis' : 'విశ్లేషణ రూపొందించండి'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIWaterAnalysis;