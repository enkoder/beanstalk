-- Migration number: 0008 	 2024-01-17T21:15:31.240Z
ALTER TABLE tags
    ADD `use_tournament_limits` NUMBER default 1;
