import { CreateUserRequest, UpdateUserRequest, UserResponse } from "./types";

export class UsersService {
  static async getUser(id: string): Promise<UserResponse> {
    const response = await fetch(`api/user/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to get user");
    }

    const toReturn = response.json() as Promise<UserResponse>;
    return toReturn;
  }

  static async updateUser(id: string, request: UpdateUserRequest): Promise<UserResponse> {
    const response = await fetch(`api/user/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: request.isVerified }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user");
    }

    return response.json() as Promise<UserResponse>;
  }

  static async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const response = await fetch(`api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      switch (response.status) {
        case 409:
          throw new Error("User already exists");
        case 400:
          throw new Error("Invalid request");
        default:
          throw new Error("Unable to create user");
      }
    }

    return response.json() as Promise<UserResponse>;
  }
}
