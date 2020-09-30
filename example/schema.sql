START TRANSACTION;
-- WARNING: this database is shared with postgraphile-core, don't run the tests in parallel!
DROP SCHEMA IF EXISTS example CASCADE;
CREATE SCHEMA example;
CREATE TABLE example.tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    done BOOLEAN default false
);
COMMENT ON COLUMN example.tasks.description IS E'@omit create,update,delete';
END TRANSACTION;