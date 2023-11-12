-- Migration number: 0006 	 2023-11-12T21:54:03.035Z
DROP TABLE leaderboard;
CREATE TABLE leaderboards (
	`user_id` integer NOT NULL,
	`season_id` integer NOT NULL,
	`rank` integer NOT NULL,
	`points` integer NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
    FOREIGN KEY(season_id) REFERENCES seasons(id)
    PRIMARY KEY (user_id, season_id)
);
