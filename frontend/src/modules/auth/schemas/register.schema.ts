import { z } from "zod";
import { TEAM_OPTIONS } from "@/modules/auth/constants/register-options";

const TEAM_VALUES = TEAM_OPTIONS.map((option) => option.value) as [
  (typeof TEAM_OPTIONS)[number]["value"],
  ...(typeof TEAM_OPTIONS)[number]["value"][],
];

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    team: z.enum(TEAM_VALUES).optional(),
    role: z.enum(["EMPLOYEE", "MANAGER"]),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password can be at most 64 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one digit")
      .regex(/[!@#$%^&*(),.?:{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.role === "MANAGER" || !!data.team, {
    message: "Employee for team selection is required",
    path: ["team"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
