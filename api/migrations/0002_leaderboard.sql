-- Migration number: 0003 	 2023-10-11T03:13:19.110Z
CREATE TABLE leaderboard (
	`user_id` integer NOT NULL,
	`rank` integer NOT NULL,
	`points` integer NOT NULL,
	`most_recent_tournament_id` integer NOT NULL,
    FOREIGN KEY(most_recent_tournament_id) REFERENCES tournaments(id)
);
