-- XAPPY AI Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Note: pgvector extension will be added via Alembic migration
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE xappy_db TO xappy;

-- Create schema for audit trail (optional separation)
-- CREATE SCHEMA IF NOT EXISTS audit;
-- GRANT ALL ON SCHEMA audit TO xappy;
