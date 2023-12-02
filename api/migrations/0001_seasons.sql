-- Migration number: 0001 	 2023-10-09T21:33:24.073Z
CREATE TABLE seasons
(
    `id`         INTEGER PRIMARY KEY NOT NULL,
    `name`       TEXT                NOT NULL,
    `started_at` TEXT                NOT NULL,
    `ended_at`   TEXT
);

INSERT INTO seasons (id, name, started_at, ended_at)
VALUES (0, 'Hello World', '2023-01-01T00:00:00Z', null);
