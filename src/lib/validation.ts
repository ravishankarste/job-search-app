import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password cannot be longer than 72 characters to prevent authentication delays"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(1, "Password is required")
    .max(72, "Password cannot be longer than 72 characters"),
});
