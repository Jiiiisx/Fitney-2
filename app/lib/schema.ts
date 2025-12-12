import { Description } from '@radix-ui/react-dialog';
import { uuid, varchar, text, date, timestamp, pgTable, serial, int, boolean, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey(),
    username: varchar('username').notNull(),
    email: varchar('email').notNull,
    full_name: varchar('fullname'),
    password_hash: text('password_hash').notNull(),
    date_of_birth: date('date_of_birth'),
    gender: varchar('gender'),
    created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  }
);

export const categories = pgTable('categories', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull()
  }
);

export const exercises = pgTable('exercises', {
    id: serial('id').primaryKey(),
    wger_id: int('wger_id').unique(),
    name: varchar('name').notNull(),
    description: text('description'),
    category_id: int('category_id').references(categories),
    image_url: varchar('image_url'),
    updated_at: timestamp('updated_at', { withTimezone: true })
  }
);

export const workout_programs = pgTable('workout_programs', {
    id: serial('id').primaryKey(),
    name: varchar('name').notNull(),
    description: text('description'),
    weeks: int('weeks'),
    created_at: timestamp('created_at', { withTimezone: true })
  }
);

export const program_days = pgTable('programs_days', {
    id: serial('id').primaryKey(),
    program_id: int('program_id').notNull().references(workout_programs).unique(),
    day_number: int('day_number').unique(),
    name: varchar('name'),
    description: text('description'),
  }
);

export const program_days_exercises = pgTable('program_day_exercises', {
    id: serial('id').primaryKey(),
    program_day_id: int('program_day_id').notNull().references(program_days),
    exercises_id: int('exercises_id').notNull().references(exercises),
    sets: int('sets'),
    reps: varchar('reps'),
    duration_seconds: int('duration_seconds'),
    notes: text('notes'),
    display_order: int('display_order').default(0)
  }
);

export const user_plans = pgTable('user_plans', {
    id: serial('user_plans').primaryKey(),
    user_id: uuid('user_id').notNull().references(users),
    source_program_id: int('source_program_id').references(workout_programs),
    start_date: date('start_date').notNull().default(curent_date),
    is_active: boolean('is_active').default(true),
    created_at: timestamp('created_at', { withTimezone: true })
  }
);

export const user_plan_days = pgTable('user_plan_days', {
    id: serial('id').primaryKey(),
    user_plan_id: int('user_plan_id').notNull().references(user_plans),
    day_number: int('day_number').notNull(),
    date: int('date').notNull(),
    name: varchar('name'),
    description: text('description')
  }
);

export const user_plan_day_exercises = pgTable('user_plan_day_exercises', {
    id: serial('id').primaryKey(),
    user_plan_day_id: int('user_plan_day_id').notNull().references(user_plan_days),
    exercises_id: int('exercises_id').notNull().references(exercises),
    sets: int('sets'),
    reps: varchar('reps'),
    duration_seconds: int('duration_seconds'),
    notes: text('notes'),
    display_order: int('display_order').default(0),
    is_completed: boolean('is_completed').default(false)
  }
);

export const workout_logs = pgTable('workout_logs', {
    id: serial('id').primaryKey(),
    user_id: uuid('user_id').notNull().references(users),
    date: timestamp('date', { withTimezone:true }).notNull(),
    type: varchar('type').notNull(),
    name: varchar('name').notNull(),
    duration_min: int('duration_min'),
    calories_burned: int('calories_burned'),
    sets: int('sets'),
    reps: varchar('reps'),
    weight_kg: numeric('weight_kg'),
    distance_km: numeric('distance_km')
  }
);

