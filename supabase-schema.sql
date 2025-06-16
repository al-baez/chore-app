-- Supabase Database Schema for Household Chore Scoring System

-- Create chores table
CREATE TABLE chores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER NOT NULL,
  is_negative BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chore_logs table
CREATE TABLE chore_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chore_id UUID REFERENCES chores(id) ON DELETE CASCADE,
  partner TEXT NOT NULL CHECK (partner IN ('partner1', 'partner2')),
  date DATE NOT NULL,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_chore_logs_date ON chore_logs(date);
CREATE INDEX idx_chore_logs_partner ON chore_logs(partner);
CREATE INDEX idx_chore_logs_chore_id ON chore_logs(chore_id);

-- Insert initial chores data
INSERT INTO chores (name, category, points, is_negative) VALUES
  ('Washing dishes', 'Kitchen', 5, false),
  ('Cooking dinner', 'Kitchen', 8, false),
  ('Taking out trash', 'Cleaning', 3, false),
  ('Vacuuming', 'Cleaning', 5, false),
  ('Laundry', 'Cleaning', 6, false),
  ('Grocery shopping', 'Errands', 7, false),
  ('Left dishes in sink', 'Kitchen', 3, true),
  ('Forgot to take out trash', 'Cleaning', 2, true),
  ('Left clothes on floor', 'Cleaning', 2, true);

-- Enable Row Level Security (RLS) if needed
ALTER TABLE chores ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on chores" ON chores FOR ALL USING (true);
CREATE POLICY "Allow all operations on chore_logs" ON chore_logs FOR ALL USING (true); 