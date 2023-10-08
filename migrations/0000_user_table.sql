-- Migration number: 0000 	 2023-10-08T14:59:00.689Z
CREATE TABLE users (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL
);
