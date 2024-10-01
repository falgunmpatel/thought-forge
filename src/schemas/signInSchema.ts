import { z } from "zod";

export const signInSchema = z.object({
  identifier: z
    .string()
    .min(1)
    .regex(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Invalid email format"
    ),
  password: z.string().min(6).max(16),
});
