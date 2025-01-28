import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";
import { CreateUserRequest, UpdateUserRequest, updateUserRequestSchema, UserResponse } from "./types";

export class UsersService {
  static getFullName(user: User): string {
    const nameParts = [user.firstName, user.lastName].filter(Boolean);
    return nameParts.join(" ");
  }

  static convertUserToUserResponse(user: User): UserResponse {
    const fullName = UsersService.getFullName(user);
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName,
      email: user.email,
      phone: user.phone ?? null,
      isIdVerified: user.isIdVerified,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      balance: user.balance,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  static async getUserById(id: string): Promise<UserResponse | null> {
    console.log("Getting user by id", id);
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return UsersService.convertUserToUserResponse(user);
  }

  static async getUserByEmail(email: string): Promise<UserResponse | null> {
    const idFromEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!idFromEmail) {
      return null;
    }

    return UsersService.getUserById(idFromEmail.id);
  }

  static async updateUser(id: string, request: UpdateUserRequest): Promise<UserResponse> {
    const payload = updateUserRequestSchema.parse(request);
    const originalUser = await prisma.user.findUnique({ where: { id } });
    if (payload.email) {
      if (payload.email !== originalUser?.email) {
        payload.isEmailVerified = false;
      }
    }
    if (payload.phone) {
      if (payload.phone !== originalUser?.phone) {
        payload.isPhoneVerified = false;
      }
    }
    await prisma.user.update({
      where: { id },
      data: { ...payload },
    });

    const userResponse = await UsersService.getUserById(id);
    if (!userResponse) {
      throw new Error("User not found");
    }
    return userResponse;
  }

  static async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const { firstName, lastName, email, password } = request;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        hashedPassword,
      },
    });

    return UsersService.convertUserToUserResponse(user);
  }
}
