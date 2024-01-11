-- Migration number: 0006 	 2024-01-11T18:42:28.661Z
ALTER TABLE main.tournaments
    ADD `fingerprint` STRING;
