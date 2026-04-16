-- Saved Properties (Wishlist) feature
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS saved_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_saved_properties_user ON saved_properties(user_id);

-- RLS
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved" ON saved_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved" ON saved_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved" ON saved_properties
  FOR DELETE USING (auth.uid() = user_id);
