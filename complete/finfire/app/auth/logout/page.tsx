"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
export default function LogoutPage() {
  const [text, setText] = useState("Logging out...");
  useEffect(() => {
    const form = document.getElementById("logout-form") as HTMLFormElement;
    form.requestSubmit();
    if (logout) {
      logout();
    }
    setText("Logout Successful");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <form id="logout-form" action={logout}>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">{text}</h1>
            </div>
          </div>
        </form>
        <Link href="/auth/login">
          <Button>Back to Login</Button>
        </Link>
      </div>
    </div>
  );
}
