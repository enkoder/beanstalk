-- Migration number: 0005 	 2023-10-24T15:13:08.047Z
ALTER TABLE results ADD `runner_deck_identity_name` text;
ALTER TABLE results ADD `corp_deck_identity_name` text;
ALTER TABLE results ADD `runner_deck_faction` text;
ALTER TABLE results ADD `corp_deck_faction` text;
