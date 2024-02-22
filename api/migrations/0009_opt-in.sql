-- Migration number: 0009 	 2024-02-21T03:16:56.754Z
-- Moving all users to be opt-in by default
PRAGMA defer_foreign_keys=ON;

CREATE TABLE users_dg_tmp
(
    `id`       integer           not null
        primary key,
    `name`     text,
    `email`    text,
    `password` text,
    `is_admin` integer default 0 not null,
    -- setting default value to 1
    `disabled` integer default 1
);

INSERT INTO users_dg_tmp(`id`, `name`, `email`, `password`, `is_admin`, `disabled`)
SELECT `id`, `name`, `email`, `password`, `is_admin`, `disabled`
FROM users;

DROP TABLE users;
ALTER TABLE users_dg_tmp
    RENAME TO users;

-- update all existing users to be disabled, requiring everyone to opt-in
UPDATE users
SET `disabled`=1
where `disabled`= 0;

PRAGMA defer_foreign_keys=OFF;