-- This table stores normalized exercise categories.
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

-- This is the final, clean table for exercises that the application will use.
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT REFERENCES categories(id),
  image_url VARCHAR(255),
  wger_id INT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- This table is for staging raw data fetched from the WGER API.
CREATE TABLE IF NOT EXISTS api_exercises_staging (
  id SERIAL PRIMARY KEY,
  api_id INT UNIQUE NOT NULL,
  name VARCHAR(255),
  description TEXT,
  category_name VARCHAR(255),
  image_url VARCHAR(255),
  raw_data JSONB,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- This table stores logged workouts from users.
CREATE TABLE IF NOT EXISTS workout_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- Should reference your users table
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    type VARCHAR(50) NOT NULL, -- 'strength' or 'cardio'
    name VARCHAR(255) NOT NULL,
    duration_min INTEGER,
    distance_km NUMERIC(10, 2),
    sets INTEGER,
    reps INTEGER,
    weight_kg NUMERIC(10, 2)
);

-- Create an index on category_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_exercises_category_id ON exercises(category_id);

-- Optional: Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at
BEFORE UPDATE ON exercises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- New Tables for Workout Programs
CREATE TABLE IF NOT EXISTS workout_programs (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  weeks INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS program_days (
  id SERIAL PRIMARY KEY,
  program_id INT NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  day_number INT NOT NULL, -- e.g., Day 1, Day 2
  name VARCHAR(255), -- e.g., "Upper Body A", "Rest Day"
  description TEXT,
  UNIQUE(program_id, day_number)
);

CREATE TABLE IF NOT EXISTS program_day_exercises (
  id SERIAL PRIMARY KEY,
  program_day_id INT NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id),
  sets INT,
  reps VARCHAR(50), -- e.g., "8-12" or "To Failure"
  duration_seconds INT,
  notes TEXT,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_plans (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL, -- Should have a foreign key to your users table
  source_program_id INT REFERENCES workout_programs(id), -- Track original template
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensures a user can only have one plan where is_active = true
CREATE UNIQUE INDEX IF NOT EXISTS user_active_plan_is_active_idx
ON user_plans (user_id)
WHERE (is_active = true);

-- These tables will hold the user's own editable copy of the plan
CREATE TABLE IF NOT EXISTS user_plan_days (
  id SERIAL PRIMARY KEY,
  user_plan_id INT NOT NULL REFERENCES user_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL, -- The day number within the plan (e.g., 1, 2, 3...)
  date DATE, -- The specific calendar date for this workout
  name VARCHAR(255),
  description TEXT,
  UNIQUE (user_plan_id, date)
);

CREATE TABLE IF NOT EXISTS user_plan_day_exercises (
  id SERIAL PRIMARY KEY,
  user_plan_day_id INT NOT NULL REFERENCES user_plan_days(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id),
  sets INT,
  reps VARCHAR(50),
  duration_seconds INT,
  notes TEXT,
  display_order INT DEFAULT 0
);
