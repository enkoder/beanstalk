-- Migration number: 0005 	 2024-01-05T00:39:34.914Z
CREATE TABLE tags
(
    `id`         INTEGER PRIMARY KEY AUTOINCREMENT,
    `name`       TEXT    NOT NULL UNIQUE,
    `normalized` TEXT    NOT NULL UNIQUE,
    `owner_id`   INTEGER NOT NULL,

    FOREIGN KEY (owner_id) REFERENCES users (id)
);

CREATE TABLE tournament_tags
(
    `tournament_id` INTEGER NOT NULL,
    `tag_id`        INTEGER NOT NULL,

    FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id),
    PRIMARY KEY (tournament_id, tag_id)
);
