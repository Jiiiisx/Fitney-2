import {
  boolean,
  index,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums defined from CHECK constraints or clear value lists in the SQL schema
export const goalCategoryEnum = pgEnum('goal_category', ['weekly', 'long_term']);

export const goalMetricEnum = pgEnum('goal_metric', [
  'workout_frequency',
  'calories_burned',
  'active_minutes',
  'hydration',
  'distance_run',
  'weight_lifted',
  'yoga_sessions',
  'challenges_joined',
]);

export const userSettingsThemeEnum = pgEnum('user_settings_theme', ['light', 'dark', 'system']);
export const userSettingsUnitsEnum = pgEnum('user_settings_measurement_units', ['metric', 'imperial']);

// Base User Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  fullName: varchar('full_name', { length: 255 }),
  imageUrl: varchar('image_url', { length: 225 }),
  passwordHash: text('password_hash').notNull(),
  dateOfBirth: date('date_of_birth'),
  gender: varchar('gender', { length: 50 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  level: integer('level').default(1).notNull(),
  xp: integer('xp').default(0).notNull(),
});

// Exercise and Category Tables
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
});

export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  wgerId: integer('wger_id').unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: integer('category_id').references(() => categories.id),
  imageUrl: varchar('image_url', { length: 255 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Workout Program Templates
export const workoutPrograms = pgTable('workout_programs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  weeks: integer('weeks'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const programDays = pgTable('program_days', {
  id: serial('id').primaryKey(),
  programId: integer('program_id').notNull().references(() => workoutPrograms.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
}, (table) => {
  return {
    programDayUnique: unique().on(table.programId, table.dayNumber),
  };
});

export const programDayExercises = pgTable('program_day_exercises', {
  id: serial('id').primaryKey(),
  programDayId: integer('program_day_id').notNull().references(() => programDays.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  sets: integer('sets'),
  reps: varchar('reps', { length: 50 }),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  displayOrder: integer('display_order').default(0),
});

// User-specific Workout Plans
export const userPlans = pgTable('user_plans', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceProgramId: integer('source_program_id').references(() => workoutPrograms.id),
  startDate: date('start_date').notNull().defaultNow(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    userActivePlanIdx: uniqueIndex('user_active_plan_is_active_idx').on(table.userId).where(sql`${table.isActive} = true`),
  };
});

export const userPlanDays = pgTable('user_plan_days', {
  id: serial('id').primaryKey(),
  userPlanId: integer('user_plan_id').notNull().references(() => userPlans.id, { onDelete: 'cascade' }),
  dayNumber: integer('day_number').notNull(),
  date: date('date').notNull(),
  name: varchar('name', { length: 255 }),
  description: text('description'),
});

export const userPlanDayExercises = pgTable('user_plan_day_exercises', {
  id: serial('id').primaryKey(),
  userPlanDayId: integer('user_plan_day_id').notNull().references(() => userPlanDays.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  sets: integer('sets'),
  reps: varchar('reps', { length: 50 }),
  durationSeconds: integer('duration_seconds'),
  notes: text('notes'),
  displayOrder: integer('display_order').default(0),
  isCompleted: boolean('is_completed').default(false),
});

// Workout History/Logs
export const workoutLogs = pgTable('workout_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: timestamp('date', { withTimezone: true }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'Strength', 'Cardio', etc.
  name: varchar('name', { length: 255 }).notNull(),
  durationMin: integer('duration_min'),
  caloriesBurned: integer('calories_burned'),
  sets: integer('sets'),
  reps: varchar('reps', { length: 50 }),
  weightKg: numeric('weight_kg', { precision: 10, scale: 2 }),
  distanceKm: numeric('distance_km', { precision: 10, scale: 2 }),
}, (table) => {
  return {
    workoutLogsUserDateIdx: index('workout_logs_user_date_idx').on(table.userId,table.date),
  };
});

// Nutrition Tracking
export const foods = pgTable('foods', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  caloriesPer100g: numeric('calories_per_100g', { precision: 10, scale: 2 }),
  proteinPer100g: numeric('protein_per_100g', { precision: 10, scale: 2 }),
  carbsPer100g: numeric('carbs_per_100g', { precision: 10, scale: 2 }),
  fatPer100g: numeric('fat_per_100g', { precision: 10, scale: 2 }),
});

export const foodLogs = pgTable('food_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  foodId: integer('food_id').notNull().references(() => foods.id),
  date: date('date').notNull(),
  servingSizeG: numeric('serving_size_g', { precision: 10, scale: 2 }).notNull(),
});

// Goal Tracking
export const userGoals = pgTable('user_goals', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  category: goalCategoryEnum('category').notNull(),
  metric: goalMetricEnum('metric').notNull(),
  targetValue: integer('target_value').notNull(),
  currentValue: integer('current_value').default(0),
  startDate: date('start_date').defaultNow(),
  endDate: date('end_date'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Social/Community Features
export const followers = pgTable('followers', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.followerId] }),
  };
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content'),
  imageUrl: varchar('image_url', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const postLikes = pgTable('post_likes', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.postId, table.userId] }),
  };
});

export const postComments = pgTable('post_comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// User Settings
export const userSettings = pgTable('user_settings', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  theme: userSettingsThemeEnum('theme').default('system'),
  measurementUnits: userSettingsUnitsEnum('measurement_units').default('metric'),
  emailNotifications: boolean('email_notifications').default(true),
  pushNotifications: boolean('push_notifications').default(true),
  hasCompletedOnboarding: boolean('has_completed_onboarding').default(false),
});

// Body Measurements
export const bodyMeasurements = pgTable('body_measurements', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull().defaultNow(),
  heightCm: numeric('height_cm', { precision: 10, scale: 1 }),
  weightKg: numeric('weight_kg', { precision: 10, scale: 2 }),
  bodyFatPercentage: numeric('body_fat_percentage', { precision: 5, scale: 2 }),
  waistCm: numeric('waist_cm', { precision: 10, scale: 2 }),
  chestCm: numeric('chest_cm', { precision: 10, scale: 2 }),
  hipsCm: numeric('hips_cm', { precision: 10, scale: 2 }),
}, (table) => {
  return {
    userDateUnique: unique().on(table.userId, table.date),
  };
});

// Sleep Tracking
export const sleepLogs = pgTable('sleep_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  qualityRating: integer('quality_rating'), // CHECK constraint handled by application logic or a raw SQL check
  notes: text('notes'),
}, (table) => ({
    qualityCheck: sql`CHECK (${table.qualityRating} >= 1 AND ${table.qualityRating} <= 5)`
}));

// Water Intake
export const waterLogs = pgTable('water_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date('date').notNull(),
  amountMl: integer('amount_ml').notNull(),
}, (table) => {
  return {
    userDateUnique: unique().on(table.userId, table.date),
  };
});

// Notifications
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }),
  message: text('message').notNull(),
  linkUrl: varchar('link_url', { length: 255 }),
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// Gamification/Achievements
export const achievements = pgTable('achievements', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  iconUrl: varchar('icon_url', { length: 255 }),
});

export const userAchievements = pgTable('user_achievements', {
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp('unlocked_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.achievementId] }),
  };
});

export const userStreaks = pgTable('user_streaks', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer('current_streak').default(0),
  longestStreak: integer('longest_streak').default(0),
  lastActivityDate: date('last_activity_date'),
});

// User Onboarding Profile
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  mainGoal: varchar('main_goal', { length: 50 }),
  experienceLevel: varchar('experience_level', { length: 50 }),
  workoutLocation: varchar('workout_location', { length: 50 }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ one, many }) => ({
	userProfile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
	userSettings: one(userSettings, { fields: [users.id], references: [userSettings.userId] }),
	userStreak: one(userStreaks, { fields: [users.id], references: [userStreaks.userId] }),
	posts: many(posts),
	userPlans: many(userPlans),
	workoutLogs: many(workoutLogs),
	foodLogs: many(foodLogs),
	userGoals: many(userGoals),
	bodyMeasurements: many(bodyMeasurements),
	sleepLogs: many(sleepLogs),
	waterLogs: many(waterLogs),
	notifications: many(notifications),
	userAchievements: many(userAchievements),
	followers: many(followers, { relationName: 'followers' }),
	following: many(followers, { relationName: 'following' }),
	postLikes: many(postLikes),
	postComments: many(postComments),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
	user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
	user: one(users, { fields: [userSettings.userId], references: [users.id] }),
}));

export const userStreaksRelations = relations(userStreaks, ({ one }) => ({
	user: one(users, { fields: [userStreaks.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
	category: one(categories, { fields: [exercises.categoryId], references: [categories.id] }),
	programDayExercises: many(programDayExercises),
	userPlanDayExercises: many(userPlanDayExercises),
}));

export const workoutProgramsRelations = relations(workoutPrograms, ({ many }) => ({
	programDays: many(programDays),
	userPlans: many(userPlans),
}));

export const programDaysRelations = relations(programDays, ({ one, many }) => ({
	program: one(workoutPrograms, { fields: [programDays.programId], references: [workoutPrograms.id] }),
	programDayExercises: many(programDayExercises),
}));

export const programDayExercisesRelations = relations(programDayExercises, ({ one }) => ({
	programDay: one(programDays, { fields: [programDayExercises.programDayId], references: [programDays.id] }),
	exercise: one(exercises, { fields: [programDayExercises.exerciseId], references: [exercises.id] }),
}));

export const userPlansRelations = relations(userPlans, ({ one, many }) => ({
	user: one(users, { fields: [userPlans.userId], references: [users.id] }),
	sourceProgram: one(workoutPrograms, { fields: [userPlans.sourceProgramId], references: [workoutPrograms.id] }),
	userPlanDays: many(userPlanDays),
}));

export const userPlanDaysRelations = relations(userPlanDays, ({ one, many }) => ({
	userPlan: one(userPlans, { fields: [userPlanDays.userPlanId], references: [userPlans.id] }),
	userPlanDayExercises: many(userPlanDayExercises),
}));

export const userPlanDayExercisesRelations = relations(userPlanDayExercises, ({ one }) => ({
	userPlanDay: one(userPlanDays, { fields: [userPlanDayExercises.userPlanDayId], references: [userPlanDays.id] }),
	exercise: one(exercises, { fields: [userPlanDayExercises.exerciseId], references: [exercises.id] }),
}));

export const workoutLogsRelations = relations(workoutLogs, ({ one }) => ({
	user: one(users, { fields: [workoutLogs.userId], references: [users.id] }),
}));

export const foodsRelations = relations(foods, ({ many }) => ({
	foodLogs: many(foodLogs),
}));

export const foodLogsRelations = relations(foodLogs, ({ one }) => ({
	user: one(users, { fields: [foodLogs.userId], references: [users.id] }),
	food: one(foods, { fields: [foodLogs.foodId], references: [foods.id] }),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
	user: one(users, { fields: [userGoals.userId], references: [users.id] }),
}));

export const followersRelations = relations(followers, ({ one }) => ({
	user: one(users, { fields: [followers.userId], references: [users.id], relationName: 'followers' }),
	follower: one(users, { fields: [followers.followerId], references: [users.id], relationName: 'following' }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	user: one(users, { fields: [posts.userId], references: [users.id] }),
	likes: many(postLikes),
	comments: many(postComments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
	post: one(posts, { fields: [postLikes.postId], references: [posts.id] }),
	user: one(users, { fields: [postLikes.userId], references: [users.id] }),
}));

export const postCommentsRelations = relations(postComments, ({ one }) => ({
	post: one(posts, { fields: [postComments.postId], references: [posts.id] }),
	user: one(users, { fields: [postComments.userId], references: [users.id] }),
}));

export const bodyMeasurementsRelations = relations(bodyMeasurements, ({ one }) => ({
	user: one(users, { fields: [bodyMeasurements.userId], references: [users.id] }),
}));

export const sleepLogsRelations = relations(sleepLogs, ({ one }) => ({
	user: one(users, { fields: [sleepLogs.userId], references: [users.id] }),
}));

export const waterLogsRelations = relations(waterLogs, ({ one }) => ({
	user: one(users, { fields: [waterLogs.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
	user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
	userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
	user: one(users, { fields: [userAchievements.userId], references: [users.id] }),
	achievement: one(achievements, { fields: [userAchievements.achievementId], references: [achievements.id] }),
}));
