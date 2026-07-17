import { z } from 'zod';
import { type ClassValue, clsx } from 'clsx';

// ─── CLASS MERGING ────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ─── FORMATTERS ──────────────────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ─── VALIDATION SCHEMAS ──────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid university email')
      .refine((e) => e.includes('.edu') || e.includes('@'), {
        message: 'Use your university email',
      }),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
    userType: z.enum(['student', 'provider'], {
      required_error: 'Select your account type',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const onboardingSchema = z.object({
  university: z.string().min(2, 'Enter your university name'),
  city: z.string().min(2, 'Enter your city'),
  budget: z
    .number({ invalid_type_error: 'Enter a number' })
    .min(200, 'Minimum budget is $200')
    .max(5000, 'Maximum is $5,000'),
  moveInDate: z.string().min(1, 'Select a move-in date'),
  genderPreference: z.string(),
  preferences: z.array(z.string()).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type OnboardingFormData = z.infer<typeof onboardingSchema>;
