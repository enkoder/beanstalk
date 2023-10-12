-- Migration number: 0004 	 2023-10-13T17:50:18.601Z
CREATE TABLE results (
    `tournament_id`	integer NOT NULL,
	`user_id` integer NOT NULL,
	`runner_deck_identity_id` number NOT NULL,
	`runner_deck_url` text,
	`corp_deck_identity_id` number NOT NULL,
	`corp_deck_url` text,
	'rank_swiss' INTEGER NOT NULL,
	'rank_cut' INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    PRIMARY KEY (tournament_id, user_id)
);