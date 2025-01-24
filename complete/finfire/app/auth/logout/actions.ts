"use server";

import { cookies } from "next/headers";

export async function handleLogout() {
  cookies().delete("authToken");
}
