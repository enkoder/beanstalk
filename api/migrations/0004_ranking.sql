-- Migration number: 0004 	 2023-10-15T00:49:08.495Z
ALTER TABLE results ADD `points_earned` integer NOT NULL DEFAULT 0;
ALTER TABLE results ADD `season_id` integer NOT NULL DEFAULT 0;
ALTER TABLE users ADD `is_admin` integer NOT NULL DEFAULT 0;
ALTER TABLE tournaments ADD `registration_count` integer NOT NULL DEFAULT 0;