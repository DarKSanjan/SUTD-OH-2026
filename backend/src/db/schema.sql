-- Event Check-In System Database Schema
-- PostgreSQL Schema for Supabase

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tshirt_size TEXT NOT NULL,
  meal_preference TEXT NOT NULL,
  organization_details TEXT,
  consented BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create case-insensitive index on student_id for fast lookups
CREATE INDEX idx_student_id ON students(LOWER(student_id));

-- Tokens table
CREATE TABLE tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  student_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- Create indexes for fast token lookups
CREATE INDEX idx_token ON tokens(token);
CREATE INDEX idx_token_student ON tokens(student_id);

-- Claims table
CREATE TABLE claims (
  id SERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  tshirt_claimed BOOLEAN DEFAULT FALSE,
  meal_claimed BOOLEAN DEFAULT FALSE,
  tshirt_claimed_at TIMESTAMP,
  meal_claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
  UNIQUE(student_id)
);

-- Create index for fast claim lookups
CREATE INDEX idx_claims_student ON claims(student_id);
