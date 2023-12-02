-- Migration number: 0002 	 2023-10-11T03:13:19.110Z
CREATE TABLE tournaments
(
    `id`            INTEGER PRIMARY KEY NOT NULL,
    `name`          TEXT                NOT NULL,
    `location`      TEXT                NOT NULL,
    `concluded`     INTEGER             NOT NULL,
    `format`        TEXT                NOT NULL,
    `type`          TEXT                NOT NULL,
    `players_count` INTEGER             NOT NULL,
    `date`          TEXT,
    `season_id`     INTEGER,

    FOREIGN KEY (season_id) REFERENCES seasons (id)
);
