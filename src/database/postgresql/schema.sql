-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS mission_skills CASCADE;
DROP TABLE IF EXISTS missions CASCADE;

-- Missions table
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    experience_level VARCHAR(100),
    duration VARCHAR(100),
    location VARCHAR(100),
    price DECIMAL,
    work_type VARCHAR(50),
    mission_type VARCHAR(50),
    is_published BOOLEAN DEFAULT FALSE,
    discord_message_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mission skills table
CREATE TABLE mission_skills (
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    skill VARCHAR(100),
    PRIMARY KEY (mission_id, skill)
);

-- Set ownership
ALTER TABLE missions OWNER TO botuser;
ALTER TABLE mission_skills OWNER TO botuser;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_missions_published ON missions(is_published);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at);