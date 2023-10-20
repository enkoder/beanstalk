-- Migration number: 0005 	 2023-10-20T22:59:27.602Z
ALTER TABLE results ADD `num_players` integer NOT NULL DEFAULT 0;
