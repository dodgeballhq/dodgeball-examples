import { z } from "zod";

// Custom E.164 phone validation regex
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

export const updateUserRequestSchema = z.object({
  isIdVerified: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  isPhoneVerified: z.boolean().optional(),
  phone: z.string().regex(e164PhoneRegex, "Phone number must be in E.164 format (e.g., +12125551234)").optional(),
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  isIdVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
