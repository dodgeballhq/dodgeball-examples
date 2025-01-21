import { User } from "@prisma/client";

export interface UpdateUserRequest {
  isVerified: boolean;
}

export interface UserResponse {
  user: User;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}
