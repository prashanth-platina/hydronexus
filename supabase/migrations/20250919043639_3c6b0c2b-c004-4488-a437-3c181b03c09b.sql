-- Add proper columns to sensor_readings table
ALTER TABLE public.sensor_readings ADD COLUMN ph_level DECIMAL(3,1);
ALTER TABLE public.sensor_readings ADD COLUMN turbidity DECIMAL(5,2);
ALTER TABLE public.sensor_readings ADD COLUMN temperature DECIMAL(4,1);
ALTER TABLE public.sensor_readings ADD COLUMN bacterial_count INTEGER;
ALTER TABLE public.sensor_readings ADD COLUMN dissolved_oxygen DECIMAL(4,2);
ALTER TABLE public.sensor_readings ADD COLUMN chlorine_level DECIMAL(4,2);
ALTER TABLE public.sensor_readings ADD COLUMN location TEXT NOT NULL;
ALTER TABLE public.sensor_readings ADD COLUMN water_source_id BIGINT REFERENCES public.water_sources(id);

-- Add proper columns to water_sources table
ALTER TABLE public.water_sources ADD COLUMN name TEXT NOT NULL;
ALTER TABLE public.water_sources ADD COLUMN location TEXT NOT NULL;
ALTER TABLE public.water_sources ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE public.water_sources ADD COLUMN longitude DECIMAL(11,8);
ALTER TABLE public.water_sources ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.water_sources ADD COLUMN source_type TEXT;

-- Add proper columns to risk_predictions table
ALTER TABLE public.risk_predictions ADD COLUMN water_source_id BIGINT REFERENCES public.water_sources(id);
ALTER TABLE public.risk_predictions ADD COLUMN risk_level TEXT NOT NULL;
ALTER TABLE public.risk_predictions ADD COLUMN confidence DECIMAL(5,2);
ALTER TABLE public.risk_predictions ADD COLUMN prediction_data JSONB;
ALTER TABLE public.risk_predictions ADD COLUMN model_version TEXT;

-- Add proper columns to alert_logs table
ALTER TABLE public.alert_logs ADD COLUMN water_source_id BIGINT REFERENCES public.water_sources(id);
ALTER TABLE public.alert_logs ADD COLUMN alert_type TEXT NOT NULL;
ALTER TABLE public.alert_logs ADD COLUMN alert_level TEXT NOT NULL;
ALTER TABLE public.alert_logs ADD COLUMN message TEXT NOT NULL;
ALTER TABLE public.alert_logs ADD COLUMN is_resolved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.alert_logs ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;

-- Add proper columns to user_profiles table
ALTER TABLE public.user_profiles ADD COLUMN user_id UUID REFERENCES auth.users NOT NULL;
ALTER TABLE public.user_profiles ADD COLUMN full_name TEXT;
ALTER TABLE public.user_profiles ADD COLUMN role TEXT DEFAULT 'health_worker';
ALTER TABLE public.user_profiles ADD COLUMN phone_number TEXT;
ALTER TABLE public.user_profiles ADD COLUMN organization TEXT;

-- Enable Row Level Security
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to read sensor_readings" ON public.sensor_readings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read water_sources" ON public.water_sources FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert water_sources" ON public.water_sources FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update water_sources" ON public.water_sources FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read risk_predictions" ON public.risk_predictions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert risk_predictions" ON public.risk_predictions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to read alert_logs" ON public.alert_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to insert alert_logs" ON public.alert_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated users to update alert_logs" ON public.alert_logs FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read their own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample data
INSERT INTO public.water_sources (name, location, latitude, longitude, status, source_type) VALUES
('Community Well A', 'Sector 1, Block A', 28.6139, 77.2090, 'active', 'well'),
('Borehole B', 'Sector 2, Block B', 28.6129, 77.2080, 'active', 'borehole'),
('Hand Pump C', 'Sector 3, Block C', 28.6149, 77.2100, 'maintenance', 'hand_pump'),
('Water Tank D', 'Central Distribution', 28.6159, 77.2110, 'active', 'tank');

-- Insert sample sensor readings
INSERT INTO public.sensor_readings (ph_level, turbidity, temperature, bacterial_count, dissolved_oxygen, chlorine_level, location, water_source_id) VALUES
(7.2, 2.1, 24.5, 10, 8.5, 0.5, 'Community Well A', 1),
(6.8, 1.8, 23.8, 15, 7.8, 0.3, 'Borehole B', 2),
(7.0, 2.5, 25.2, 8, 8.2, 0.4, 'Community Well A', 1),
(6.9, 2.0, 24.1, 12, 8.0, 0.6, 'Borehole B', 2);

-- Insert sample risk predictions
INSERT INTO public.risk_predictions (water_source_id, risk_level, confidence, prediction_data, model_version) VALUES
(1, 'low', 85.5, '{"factors": ["ph_normal", "bacteria_low"], "recommendation": "Safe for consumption"}', 'v1.0'),
(2, 'medium', 72.3, '{"factors": ["ph_slightly_low", "bacteria_elevated"], "recommendation": "Monitor closely"}', 'v1.0'),
(3, 'high', 91.2, '{"factors": ["maintenance_required", "no_recent_data"], "recommendation": "Immediate attention required"}', 'v1.0');

-- Insert sample alerts
INSERT INTO public.alert_logs (water_source_id, alert_type, alert_level, message, is_resolved) VALUES
(3, 'maintenance', 'high', 'Hand Pump C requires immediate maintenance - water quality testing overdue', FALSE),
(2, 'quality', 'medium', 'Borehole B showing elevated bacterial count - recommend chlorination', FALSE),
(1, 'quality', 'low', 'Community Well A - pH levels slightly elevated but within safe range', TRUE);