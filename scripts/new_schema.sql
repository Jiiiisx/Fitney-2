-- Base User Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash TEXT NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Exercise and Category Tables
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  wger_id INT UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id INT REFERENCES categories(id),
  image_url VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Workout Program Templates
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
  day_number INT NOT NULL,
  name VARCHAR(255),
  description TEXT,
  UNIQUE(program_id, day_number)
);

CREATE TABLE IF NOT EXISTS program_day_exercises (
  id SERIAL PRIMARY KEY,
  program_day_id INT NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id),
  sets INT,
  reps VARCHAR(50),
  duration_seconds INT,
  notes TEXT,
  display_order INT DEFAULT 0
);

-- User-specific Workout Plans (active or customized)
CREATE TABLE IF NOT EXISTS user_plans (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_program_id INT REFERENCES workout_programs(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS user_active_plan_is_active_idx
ON user_plans (user_id)
WHERE (is_active = true);

CREATE TABLE IF NOT EXISTS user_plan_days (
  id SERIAL PRIMARY KEY,
  user_plan_id INT NOT NULL REFERENCES user_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  date DATE NOT NULL,
  name VARCHAR(255),
  description TEXT
);

CREATE TABLE IF NOT EXISTS user_plan_day_exercises (
  id SERIAL PRIMARY KEY,
  user_plan_day_id INT NOT NULL REFERENCES user_plan_days(id) ON DELETE CASCADE,
  exercise_id INT NOT NULL REFERENCES exercises(id),
  sets INT,
  reps VARCHAR(50),
  duration_seconds INT,
  notes TEXT,
  display_order INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false
);

-- Workout History/Logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'Strength', 'Cardio', 'Flexibility', 'Rest Day'
    name VARCHAR(255) NOT NULL,
    duration_min INTEGER,
    calories_burned INTEGER,
    -- For strength
    sets INTEGER,
    reps VARCHAR(50),
    weight_kg NUMERIC(10, 2),
    -- For cardio
    distance_km NUMERIC(10, 2)
);

-- Nutrition Tracking
CREATE TABLE IF NOT EXISTS foods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    calories_per_100g NUMERIC(10, 2),
    protein_per_100g NUMERIC(10, 2),
    carbs_per_100g NUMERIC(10, 2),
    fat_per_100g NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS food_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id INT NOT NULL REFERENCES foods(id),
    date DATE NOT NULL,
    serving_size_g NUMERIC(10, 2) NOT NULL
);

-- Goal Tracking
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- e.g., 'weight_loss', 'strength_gain_bench_press'
    target_value NUMERIC(10, 2) NOT NULL,
    current_value NUMERIC(10, 2),
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'in_progress' -- 'in_progress', 'completed', 'abandoned'
);

--
-- ++ Additional Schema based on analysis ++
--

-- Social/Community Features
CREATE TABLE IF NOT EXISTS followers (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, follower_id)
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_likes (
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS post_comments (
    id SERIAL PRIMARY KEY,
    post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system', -- 'light', 'dark', 'system'
    measurement_units VARCHAR(10) DEFAULT 'metric', -- 'metric', 'imperial'
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true
);

-- Body Measurements
CREATE TABLE IF NOT EXISTS body_measurements (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    height_cm NUMERIC(10, 1),
    weight_kg NUMERIC(10, 2),
    body_fat_percentage NUMERIC(5, 2),
    waist_cm NUMERIC(10, 2),
    chest_cm NUMERIC(10, 2),
    hips_cm NUMERIC(10, 2),
    UNIQUE(user_id, date)
);

-- Sleep Tracking
CREATE TABLE IF NOT EXISTS sleep_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    quality_rating INT CHECK (quality_rating >= 1 AND quality_rating <= 5), -- 1 to 5 scale
    notes TEXT
);

-- Water Intake
CREATE TABLE IF NOT EXISTS water_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_ml INT NOT NULL,
    UNIQUE(user_id, date)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- 'social', 'goal', 'system'
    message TEXT NOT NULL,
    link_url VARCHAR(255),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gamification/Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS user_achievements (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_streaks (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE
);