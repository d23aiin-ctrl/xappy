-- Xappy Platform — PostgreSQL Initialization
-- Creates all databases needed by the platform.
-- Runs automatically on first container start.

-- Extensions for xappy_db (Health — created by POSTGRES_DB env var)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL PRIVILEGES ON DATABASE xappy_db TO xappy;

-- Create the Oil database
CREATE DATABASE xappy_oil OWNER xappy;
\c xappy_oil
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL PRIVILEGES ON DATABASE xappy_oil TO xappy;

-- Create the Property database
\c xappy_db
CREATE DATABASE xappy_property OWNER xappy;
\c xappy_property
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
GRANT ALL PRIVILEGES ON DATABASE xappy_property TO xappy;
