CREATE TYPE "public"."goal_category" AS ENUM('weekly', 'long_term');--> statement-breakpoint
CREATE TYPE "public"."goal_metric" AS ENUM('workout_frequency', 'calories_burned', 'active_minutes', 'hydration', 'distance_run', 'weight_lifted', 'yoga_sessions', 'challenges_joined');--> statement-breakpoint
CREATE TYPE "public"."user_settings_theme" AS ENUM('light', 'dark', 'system');--> statement-breakpoint
CREATE TYPE "public"."user_settings_measurement_units" AS ENUM('metric', 'imperial');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon_url" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "ai_audits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"content" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) DEFAULT 'New Chat',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_recovery_scans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"content" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"type" varchar(50) DEFAULT 'info',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "body_measurements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"height_cm" numeric(10, 1),
	"weight_kg" numeric(10, 2),
	"body_fat_percentage" numeric(5, 2),
	"waist_cm" numeric(10, 2),
	"chest_cm" numeric(10, 2),
	"hips_cm" numeric(10, 2),
	CONSTRAINT "body_measurements_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"creator_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"goal_value" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "community_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"location" varchar(255),
	"type" varchar(50) DEFAULT 'community',
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_briefings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"content" json NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "direct_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" uuid NOT NULL,
	"receiver_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"is_read" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"wger_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category_id" integer,
	"image_url" varchar(255),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "exercises_wger_id_unique" UNIQUE("wger_id")
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"user_id" uuid NOT NULL,
	"follower_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "followers_user_id_follower_id_pk" PRIMARY KEY("user_id","follower_id")
);
--> statement-breakpoint
CREATE TABLE "food_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"food_id" integer NOT NULL,
	"date" date NOT NULL,
	"serving_size_g" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"calories_per_100g" numeric(10, 2),
	"protein_per_100g" numeric(10, 2),
	"carbs_per_100g" numeric(10, 2),
	"fat_per_100g" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "group_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"group_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(255),
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hashtags" (
	"id" serial PRIMARY KEY NOT NULL,
	"tag" varchar(50) NOT NULL,
	"is_featured" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "hashtags_tag_unique" UNIQUE("tag")
);
--> statement-breakpoint
CREATE TABLE "hidden_direct_messages" (
	"user_id" uuid NOT NULL,
	"message_id" integer NOT NULL,
	CONSTRAINT "hidden_direct_messages_user_id_message_id_pk" PRIMARY KEY("user_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "hidden_group_messages" (
	"user_id" uuid NOT NULL,
	"message_id" integer NOT NULL,
	CONSTRAINT "hidden_group_messages_user_id_message_id_pk" PRIMARY KEY("user_id","message_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sender_id" uuid,
	"type" varchar(50) NOT NULL,
	"resource_id" integer,
	"message" text NOT NULL,
	"link_url" varchar(255),
	"is_read" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_id" integer,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_hashtags" (
	"post_id" integer NOT NULL,
	"hashtag_id" integer NOT NULL,
	CONSTRAINT "post_hashtags_post_id_hashtag_id_pk" PRIMARY KEY("post_id","hashtag_id")
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"post_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "post_likes_post_id_user_id_pk" PRIMARY KEY("post_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text,
	"images" json DEFAULT '[]'::json,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "program_day_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_day_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sets" integer,
	"reps" varchar(50),
	"duration_seconds" integer,
	"notes" text,
	"display_order" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "program_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"program_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"name" varchar(255),
	"description" text,
	CONSTRAINT "program_days_program_id_day_number_unique" UNIQUE("program_id","day_number")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" varchar(50) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"admin_notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"resolved_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"user_id" uuid NOT NULL,
	"post_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saved_posts_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "sleep_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"quality_rating" integer,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"media_url" varchar(255) NOT NULL,
	"media_type" varchar(50) DEFAULT 'image',
	"created_at" timestamp with time zone DEFAULT now(),
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_views" (
	"user_id" uuid NOT NULL,
	"story_id" integer NOT NULL,
	"viewed_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "story_views_user_id_story_id_pk" PRIMARY KEY("user_id","story_id")
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"user_id" uuid NOT NULL,
	"achievement_id" integer NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_achievements_user_id_achievement_id_pk" PRIMARY KEY("user_id","achievement_id")
);
--> statement-breakpoint
CREATE TABLE "user_challenges" (
	"user_id" uuid NOT NULL,
	"challenge_id" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"joined_at" timestamp with time zone DEFAULT now(),
	"is_completed" boolean DEFAULT false,
	CONSTRAINT "user_challenges_user_id_challenge_id_pk" PRIMARY KEY("user_id","challenge_id")
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"category" "goal_category" NOT NULL,
	"metric" "goal_metric" NOT NULL,
	"target_value" integer NOT NULL,
	"current_value" integer DEFAULT 0,
	"start_date" date DEFAULT now(),
	"end_date" date,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_groups" (
	"user_id" uuid NOT NULL,
	"group_id" integer NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"is_admin" boolean DEFAULT false,
	CONSTRAINT "user_groups_user_id_group_id_pk" PRIMARY KEY("user_id","group_id")
);
--> statement-breakpoint
CREATE TABLE "user_plan_day_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_plan_day_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"sets" integer,
	"reps" varchar(50),
	"duration_seconds" integer,
	"notes" text,
	"display_order" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_plan_days" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_plan_id" integer NOT NULL,
	"day_number" integer NOT NULL,
	"date" date NOT NULL,
	"name" varchar(255),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "user_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"source_program_id" integer,
	"start_date" date DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"main_goal" varchar(50),
	"experience_level" varchar(50),
	"workout_location" varchar(50),
	"gender" varchar(20),
	"age" integer,
	"weight" numeric(10, 2),
	"height" numeric(10, 2),
	"activity_level" varchar(50),
	"tdee" integer,
	"calorie_target" integer,
	"protein_target" integer,
	"carbs_target" integer,
	"fat_target" integer,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"theme" "user_settings_theme" DEFAULT 'system',
	"measurement_units" "user_settings_measurement_units" DEFAULT 'metric',
	"font_size" varchar(50) DEFAULT 'text-size-md',
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"notification_sound" varchar(50) DEFAULT 'default',
	"vibration_enabled" boolean DEFAULT true,
	"show_popup" boolean DEFAULT true,
	"show_badge" boolean DEFAULT true,
	"channel_workout" boolean DEFAULT true,
	"channel_achievements" boolean DEFAULT true,
	"channel_social" boolean DEFAULT true,
	"has_completed_onboarding" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_streaks" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" date
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"image_url" varchar(225),
	"password_hash" text NOT NULL,
	"date_of_birth" date,
	"gender" varchar(50),
	"created_at" timestamp with time zone DEFAULT now(),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"premium_since" timestamp with time zone,
	"premium_until" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "water_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"amount_ml" integer NOT NULL,
	CONSTRAINT "water_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "workout_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"duration_min" integer,
	"calories_burned" integer,
	"sets" integer,
	"reps" varchar(50),
	"weight_kg" numeric(10, 2),
	"distance_km" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "workout_programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"weeks" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_audits" ADD CONSTRAINT "ai_audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_session_id_ai_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_recovery_scans" ADD CONSTRAINT "ai_recovery_scans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_briefings" ADD CONSTRAINT "daily_briefings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "direct_messages" ADD CONSTRAINT "direct_messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_direct_messages" ADD CONSTRAINT "hidden_direct_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_direct_messages" ADD CONSTRAINT "hidden_direct_messages_message_id_direct_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."direct_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_group_messages" ADD CONSTRAINT "hidden_group_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hidden_group_messages" ADD CONSTRAINT "hidden_group_messages_message_id_group_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."group_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_id_post_comments_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_hashtags" ADD CONSTRAINT "post_hashtags_hashtag_id_hashtags_id_fk" FOREIGN KEY ("hashtag_id") REFERENCES "public"."hashtags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_day_exercises" ADD CONSTRAINT "program_day_exercises_program_day_id_program_days_id_fk" FOREIGN KEY ("program_day_id") REFERENCES "public"."program_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_day_exercises" ADD CONSTRAINT "program_day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_days" ADD CONSTRAINT "program_days_program_id_workout_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."workout_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenges" ADD CONSTRAINT "user_challenges_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_groups" ADD CONSTRAINT "user_groups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_day_exercises" ADD CONSTRAINT "user_plan_day_exercises_user_plan_day_id_user_plan_days_id_fk" FOREIGN KEY ("user_plan_day_id") REFERENCES "public"."user_plan_days"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_day_exercises" ADD CONSTRAINT "user_plan_day_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plan_days" ADD CONSTRAINT "user_plan_days_user_plan_id_user_plans_id_fk" FOREIGN KEY ("user_plan_id") REFERENCES "public"."user_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_plans" ADD CONSTRAINT "user_plans_source_program_id_workout_programs_id_fk" FOREIGN KEY ("source_program_id") REFERENCES "public"."workout_programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaks" ADD CONSTRAINT "user_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ai_audits_user_date_idx" ON "ai_audits" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "ai_chat_messages_session_id_idx" ON "ai_chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ai_recovery_user_date_idx" ON "ai_recovery_scans" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "daily_briefings_user_date_idx" ON "daily_briefings" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "direct_messages_sender_id_idx" ON "direct_messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "direct_messages_receiver_id_idx" ON "direct_messages" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "direct_messages_created_at_idx" ON "direct_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "exercises_category_id_idx" ON "exercises" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "exercises_name_idx" ON "exercises" USING btree ("name");--> statement-breakpoint
CREATE INDEX "food_logs_user_date_idx" ON "food_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "foods_name_idx" ON "foods" USING btree ("name");--> statement-breakpoint
CREATE INDEX "group_messages_group_id_idx" ON "group_messages" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "group_messages_created_at_idx" ON "group_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "post_comments_post_id_idx" ON "post_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_goals_user_id_idx" ON "user_goals" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_active_plan_is_active_idx" ON "user_plans" USING btree ("user_id") WHERE "user_plans"."is_active" = true;--> statement-breakpoint
CREATE INDEX "workout_logs_user_date_idx" ON "workout_logs" USING btree ("user_id","date");