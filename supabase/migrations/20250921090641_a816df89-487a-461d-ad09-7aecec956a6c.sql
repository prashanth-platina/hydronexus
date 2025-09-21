-- Fix community reports RLS policies to allow submissions
DROP POLICY IF EXISTS "Allow authenticated users to insert cummunity_reports" ON public.cummunity_reports;
DROP POLICY IF EXISTS "Allow authenticated users to read cummunity_reports" ON public.cummunity_reports;

-- Enable RLS on community reports table
ALTER TABLE public.cummunity_reports ENABLE ROW LEVEL SECURITY;

-- Create new policies for community reports
CREATE POLICY "Allow anyone to read community reports" 
ON public.cummunity_reports 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated users to insert community reports" 
ON public.cummunity_reports 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Fix the column name mismatch in sensor_readings table - rename tds to tds_level
ALTER TABLE public.sensor_readings RENAME COLUMN tds TO tds_level;