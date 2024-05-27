import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, "Content must be atleast 1 character!!")
    .max(300, "Content can be max 300 characters long!!"),
});
