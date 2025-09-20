// Updated interfaces matching the complete database schema
export interface SensorReading {
  id: number;
  location: string;
  ph_level: number | null;
  turbidity: number | null;
  temperature: number | null;
  bacterial_count: number | null;
  dissolved_oxygen: number | null;
  chlorine_level: number | null;
  tds_level: number | null;
  water_source_id: number | null;
  created_at: string;
}

export interface WaterSource {
  id: number;
  name: string;
  location: string;
  status: string;
  source_type: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface RiskPrediction {
  id: number;
  risk_level: string;
  confidence: number | null;
  prediction_data: any;
  model_version: string | null;
  water_source_id: number | null;
  created_at: string;
}

export interface CommunityReport {
  id: number;
  report_description: string | null;
  severity: string | null;
  reported_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface AlertLog {
  id: number;
  alert_level: string;
  alert_type: string;
  message: string;
  water_source_id: number | null;
  is_resolved: boolean | null;
  resolved_at: string | null;
  created_at: string;
}