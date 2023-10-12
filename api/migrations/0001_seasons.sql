-- Migration number: 0002 	 2023-10-09T21:33:24.073Z
CREATE TABLE seasons (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`tier` text NOT NULL,
    `started_at` text NOT NULL,
    `ended_at` text
);

CREATE TABLE tournaments (
    `id` integer PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `date` text,
    `location` text NOT NULL,
    `concluded` integer NOT NULL,
    `season_id` integer NOT NULL,
    `format` text,
    `type` text,
    FOREIGN KEY(season_id) REFERENCES seasons(id)
);

INSERT INTO seasons (`id`, `name`, `tier`, `started_at`, `ended_at`)
    VALUES (0, "immutable", "ranked", "1970-01-01T00:00:00Z", null);

INSERT INTO tournaments (`id`, `name`, `date`, `location`, `concluded`, `season_id`, `format`, `type`)
    VALUES (0, "infinite recursion", "1970-01-01T00:00:00Z", "Jinteki.net", 0, 0, "standard", "infinite recursion");
