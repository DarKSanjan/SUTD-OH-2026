-- Migration: Add consent column to students table
-- Date: 2024
-- Description: Adds a consented boolean column to track PDPA consent

-- Add consented column with default value FALSE
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS consented BOOLEAN DEFAULT FALSE;

-- Add comment to document the column
COMMENT ON COLUMN students.consented IS 'PDPA consent flag - indicates whether participant has consented to data usage';
