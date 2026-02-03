import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inisialisasi Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Buat limiter: Maksimal 5 kali percobaan per 10 menit untuk Login/Signup
export const authRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit_auth",
});

// Limiter umum: Maksimal 20 request per 1 menit untuk API lainnya
export const generalRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "ratelimit_general",
});
