import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WaterSource } from "@/types/database";
import { TestTube, MapPin, Thermometer, Droplets } from 'lucide-react';

interface ManualDataEntryProps {
  onDataSubmitted?: () => void;
}

const ManualDataEntry: React.FC<ManualDataEntryProps> = ({ onDataSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [formData, setFormData] = useState({
    waterSourceId: '',
    location: '',
    phLevel: '',
    turbidity: '',
    temperature: '',
    bacterialCount: '',
    dissolvedOxygen: '',
    chlorineLevel: '',
    tdsLevel: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWaterSources();
  }, []);

  const fetchWaterSources = async () => {
    try {
      const { data, error } = await supabase
        .from('water_sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setWaterSources(data || []);
    } catch (error) {
      console.error('Error fetching water sources:', error);
    }
  };

  const validateForm = () => {
    const requiredFields = ['waterSourceId', 'location'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in water source and location",
        variant: "destructive",
      });
      return false;
    }

    // Validate ranges
    const validations = [
      { field: 'phLevel', min: 0, max: 14, name: 'pH Level' },
      { field: 'turbidity', min: 0, max: 1000, name: 'Turbidity' },
      { field: 'temperature', min: -10, max: 50, name: 'Temperature' },
      { field: 'bacterialCount', min: 0, max: 10000, name: 'Bacterial Count' },
      { field: 'dissolvedOxygen', min: 0, max: 20, name: 'Dissolved Oxygen' },
      { field: 'chlorineLevel', min: 0, max: 10, name: 'Chlorine Level' },
      { field: 'tdsLevel', min: 0, max: 3000, name: 'TDS Level' }
    ];

    for (const validation of validations) {
      const value = formData[validation.field as keyof typeof formData];
      if (value && (parseFloat(value) < validation.min || parseFloat(value) > validation.max)) {
        toast({
          title: "Invalid Range",
          description: `${validation.name} must be between ${validation.min} and ${validation.max}`,
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const insertData = {
        water_source_id: parseInt(formData.waterSourceId),
        location: formData.location,
        ph_level: formData.phLevel ? parseFloat(formData.phLevel) : null,
        turbidity: formData.turbidity ? parseFloat(formData.turbidity) : null,
        temperature: formData.temperature ? parseFloat(formData.temperature) : null,
        bacterial_count: formData.bacterialCount ? parseInt(formData.bacterialCount) : null,
        dissolved_oxygen: formData.dissolvedOxygen ? parseFloat(formData.dissolvedOxygen) : null,
        chlorine_level: formData.chlorineLevel ? parseFloat(formData.chlorineLevel) : null,
        tds_level: formData.tdsLevel ? parseFloat(formData.tdsLevel) : null
      };

      const { error } = await supabase
        .from('sensor_readings')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Data Recorded",
        description: "Water quality reading has been successfully recorded.",
      });

      setFormData({
        waterSourceId: '',
        location: '',
        phLevel: '',
        turbidity: '',
        temperature: '',
        bacterialCount: '',
        dissolvedOxygen: '',
        chlorineLevel: '',
        tdsLevel: ''
      });
      
      onDataSubmitted?.();
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to record data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <TestTube className="h-5 w-5 text-primary" />
          Manual Water Quality Data Entry
        </CardTitle>
        <CardDescription>
          Record water quality parameters from manual testing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="waterSource">Water Source *</Label>
              <Select
                value={formData.waterSourceId}
                onValueChange={(value) => setFormData({ ...formData, waterSourceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  {waterSources.map((source) => (
                    <SelectItem key={source.id} value={source.id.toString()}>
                      {source.name} - {source.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Specific Location *
              </Label>
              <Input
                id="location"
                placeholder="e.g., Main tap, Well head, Lab sample"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phLevel">pH Level (0-14)</Label>
              <Input
                id="phLevel"
                type="number"
                step="0.1"
                min="0"
                max="14"
                placeholder="7.0"
                value={formData.phLevel}
                onChange={(e) => setFormData({ ...formData, phLevel: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="turbidity">Turbidity (NTU)</Label>
              <Input
                id="turbidity"
                type="number"
                step="0.1"
                min="0"
                placeholder="2.5"
                value={formData.turbidity}
                onChange={(e) => setFormData({ ...formData, turbidity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperature (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="25.0"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bacterialCount">Bacterial Count (CFU/ml)</Label>
              <Input
                id="bacterialCount"
                type="number"
                min="0"
                placeholder="50"
                value={formData.bacterialCount}
                onChange={(e) => setFormData({ ...formData, bacterialCount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tdsLevel" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                TDS Level (ppm)
              </Label>
              <Input
                id="tdsLevel"
                type="number"
                step="1"
                min="0"
                placeholder="300"
                value={formData.tdsLevel}
                onChange={(e) => setFormData({ ...formData, tdsLevel: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dissolvedOxygen">Dissolved Oxygen (mg/L)</Label>
              <Input
                id="dissolvedOxygen"
                type="number"
                step="0.1"
                min="0"
                placeholder="8.5"
                value={formData.dissolvedOxygen}
                onChange={(e) => setFormData({ ...formData, dissolvedOxygen: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chlorineLevel">Chlorine Level (mg/L)</Label>
              <Input
                id="chlorineLevel"
                type="number"
                step="0.1"
                min="0"
                placeholder="0.5"
                value={formData.chlorineLevel}
                onChange={(e) => setFormData({ ...formData, chlorineLevel: e.target.value })}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Recording..." : "Record Reading"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualDataEntry;