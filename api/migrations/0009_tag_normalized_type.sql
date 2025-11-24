-- Add normalized_tournament_type column to tags table
-- This allows tags to normalize all tournaments to a single type for points calculation

ALTER TABLE tags ADD COLUMN normalized_tournament_type TEXT;
