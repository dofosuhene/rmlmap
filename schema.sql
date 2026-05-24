-- RML Group - Live GPS Tracking Setup
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.locations (
  id bigint PRIMARY KEY DEFAULT 1,
  driver_name text DEFAULT 'Driver',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  accuracy double precision,
  heading double precision,
  speed double precision,
  timestamp timestamptz DEFAULT now(),
  tour_day smallint DEFAULT 1,
  status text DEFAULT 'driving',
  broadcasting boolean DEFAULT false,
  CONSTRAINT single_row CHECK (id = 1)
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read locations"
  ON public.locations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert/update locations"
  ON public.locations FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;
ALTER TABLE public.locations REPLICA IDENTITY FULL;

INSERT INTO public.locations (id, lat, lng, broadcasting)
VALUES (1, 52.3010, -0.6940, false)
ON CONFLICT (id) DO NOTHING;
