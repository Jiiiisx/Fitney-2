import { z } from "zod";

export const workoutLogSchema = z.object({
  type: z.enum(["Strength", "Cardio", "Flexibility", "Other"]).default("Strength"),
  exerciseId: z.coerce.number().optional(),
  name: z.string().optional(),
  sets: z.coerce.number().optional(),
  reps: z.string().optional(),
  weight: z.coerce.number().optional(),
  duration: z.coerce.number().optional(), // In minutes
  distance: z.coerce.number().optional(), // In km
  share: z.string().optional().transform((val) => val === "on"),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
