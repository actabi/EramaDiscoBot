-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Missions table
CREATE TABLE IF NOT EXISTS missions (
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
CREATE TABLE IF NOT EXISTS mission_skills (
    mission_id UUID REFERENCES missions(id),
    skill VARCHAR(100),
    PRIMARY KEY (mission_id, skill)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_missions_published ON missions(is_published);
CREATE INDEX IF NOT EXISTS idx_missions_created_at ON missions(created_at);