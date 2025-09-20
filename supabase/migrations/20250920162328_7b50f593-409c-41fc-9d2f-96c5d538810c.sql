-- Add TDS column to sensor_readings table
ALTER TABLE public.sensor_readings 
ADD COLUMN tds_level numeric;

-- Add some sample data with TDS values
INSERT INTO public.sensor_readings (location, ph_level, turbidity, temperature, bacterial_count, dissolved_oxygen, chlorine_level, tds_level, water_source_id) VALUES
('Community Well A - Manual Reading', 7.2, 5.8, 22.5, 45, 8.2, 0.5, 250, 1),
('River Point B - Lab Test', 6.8, 12.3, 24.1, 89, 7.8, 0.3, 420, 2),
('Borehole C - Field Test', 7.5, 3.2, 21.8, 25, 8.9, 0.7, 180, 3),
('Lake Shore D - Quality Check', 6.5, 18.7, 26.3, 156, 6.5, 0.2, 580, 1),
('Spring E - Daily Monitor', 7.8, 2.1, 19.5, 12, 9.2, 0.8, 95, 2);

-- Add sample community reports
INSERT INTO public.cummunity_reports (report_description, severity, reported_by, notes) VALUES
('Water tastes metallic and has strange smell', 'high', 'Maria Santos', 'Noticed after recent rainfall'),
('Slight cloudiness in well water', 'medium', 'John Kimani', 'Affecting about 20 households'),
('Water pump making unusual sounds', 'low', 'Grace Wanjiku', 'May need maintenance check'),
('Dead fish found near water source', 'high', 'Peter Ochieng', 'Urgent investigation needed'),
('Water pressure very low today', 'medium', 'Sarah Muthoni', 'Started this morning');

-- Enable real-time for all tables
ALTER TABLE public.sensor_readings REPLICA IDENTITY FULL;
ALTER TABLE public.water_sources REPLICA IDENTITY FULL;
ALTER TABLE public.risk_predictions REPLICA IDENTITY FULL;
ALTER TABLE public.cummunity_reports REPLICA IDENTITY FULL;
ALTER TABLE public.alert_logs REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_sources;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cummunity_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alert_logs;