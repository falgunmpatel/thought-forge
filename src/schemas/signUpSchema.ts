import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(3, "Username must be atleast 5 characters!!")
  .max(20, "Username can be max 20 characters long!!")
  .regex(
    /^[A-Za-z0-9_]+$/,
    "Username can only contain alphabets, numbers and underscore!!"
  );

export const signUpSchema = z.object({
  username: usernameValidation,
  email: z.string().email("Invalid email address!!"),
  password: z.string().min(8, "Password must be atleast 8 characters!!"),
});
