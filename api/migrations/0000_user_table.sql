-- Migration number: 0000 	 2023-10-08T14:59:00.689Z
CREATE TABLE users
(
    `id`       INTEGER PRIMARY KEY NOT NULL,
    `is_admin` INTEGER             NOT NULL DEFAULT 0,
    `name`     TEXT,
    `email`    TEXT,
    `password` TEXT
);
