-- Migration number: 0003 	 2023-10-13T17:50:18.601Z
CREATE TABLE results
(
    `tournament_id`             INTEGER NOT NULL,
    `user_id`                   INTEGER NOT NULL,
    `runner_deck_identity_id`   INTEGER NOT NULL,
    `runner_deck_faction`       TEXT    NOT NULL,
    `runner_deck_url`           TEXT,
    `corp_deck_identity_id`     INTEGER NOT NULL,
    `corp_deck_faction`         TEXT    NOT NULL,
    `corp_deck_url`             TEXT,
    'rank_swiss'                INTEGER NOT NULL,
    'rank_cut'                  INTEGER,
    `runner_deck_identity_name` TEXT,
    `corp_deck_identity_name`   TEXT,
    `points_earned`             INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
    PRIMARY KEY (tournament_id, user_id)
);
