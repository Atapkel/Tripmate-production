import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  code: z.string().length(4, "Code must be 4 digits").regex(/^\d+$/, "Code must contain only numbers"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.new_password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const profileSchema = z.object({
  first_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long"),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Select a gender"),
  nationality: z.string().max(100, "Too long").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio can be up to 500 characters").optional().or(z.literal("")),
  country_id: z.number({ error: "Select your country" }),
  city_id: z.number({ error: "Select your city" }),
  instagram_handle: z.string().max(100, "Too long").optional().or(z.literal("")),
  telegram_handle: z.string().max(100, "Too long").optional().or(z.literal("")),
});

export const preferencesSchema = z.object({
  language_ids: z.array(z.number()).min(1, "Select at least one language"),
  interest_ids: z.array(z.number()).min(1, "Select at least one interest"),
  travel_style_ids: z.array(z.number()).min(1, "Select at least one travel style"),
});

export const tripSchema = z.object({
  destination_country_id: z.number({ error: "Select destination country" }),
  destination_city_id: z.number({ error: "Select destination city" }),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  max_budget: z.number().min(1, "Budget must be positive").max(10_000_000, "Budget seems unrealistic").optional(),
  min_budget: z.number().min(0).optional(),
  people_needed: z.number().min(1, "At least 1 person needed").max(20, "Maximum 20 people allowed"),
  min_age: z.number().min(16).max(100).optional(),
  max_age: z.number().min(16).max(100).optional(),
  gender_preference: z.string().optional(),
  description: z
    .string()
    .min(20, "Describe your trip in at least 20 characters")
    .max(2000, "Description is too long"),
}).refine((data) => new Date(data.end_date) > new Date(data.start_date), {
  message: "End date must be after start date",
  path: ["end_date"],
});

export const offerSchema = z.object({
  message: z
    .string()
    .min(10, "Write at least a short message (10 chars)")
    .max(1000, "Message is too long"),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Can't send empty message").max(5000, "Message is too long"),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: z
    .string()
    .min(8, "Minimum 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain a number"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
}).refine((d) => d.new_password !== d.current_password, {
  message: "New password must be different from current",
  path: ["new_password"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PreferencesFormData = z.infer<typeof preferencesSchema>;
export type TripFormData = z.infer<typeof tripSchema>;
export type OfferFormData = z.infer<typeof offerSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
