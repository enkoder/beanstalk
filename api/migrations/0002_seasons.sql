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
    `is_done` integer NOT NULL,
    `season_id` integer NOT NULL,
    FOREIGN KEY(season_id) REFERENCES seasons(id)
);

CREATE TABLE player_registrations (
	`id` integer PRIMARY KEY NOT NULL,
    `tournament_id`	integer NOT NULL,
	`user_id` integer NOT NULL,
	`nrdb_corp_id` text NOT NULL,
	`nrdb_runner_id` text NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE match_slips (
	`id` integer PRIMARY KEY NOT NULL,
    `date` text NOT NULL,
    `user_id_as_runner` integer NOT NULL,
    `user_id_as_corp` integer NOT NULL,
    `runner_points` integer NOT NULL,
    `corp_points` integer NOT NULL,
    `nrdb_corp_id` text NOT NULL,
    `nrdb_runner_id` text NOT NULL,
    `tournament_id` integer,
    `round_number` integer,
    FOREIGN KEY(user_id_as_corp) REFERENCES users(id),
    FOREIGN KEY(user_id_as_runner) REFERENCES users(id),
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
);

INSERT INTO seasons (`id`, `name`, `tier`, `started_at`, `ended_at`)
    VALUES (0, "immutable", "ranked", "1970-01-01T00:00:00Z", null);

INSERT INTO tournaments (`id`, `name`, `date`, `location`, `is_done`, `season_id`)
    VALUES (0, "infinite recursion", "1970-01-01T00:00:00Z", "Jinteki.net", 0, 0);
