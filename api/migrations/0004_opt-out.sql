-- Migration number: 0004 	 2024-01-01T17:18:09.288Z
-- Adding a disabled flag so a user can opt-out
ALTER TABLE users
    ADD `disabled` INTEGER DEFAULT 0;