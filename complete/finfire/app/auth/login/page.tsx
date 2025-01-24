"use client";

import { login } from "@/auth";
import LogoCard from "@/components/custom/logo-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { NavigationRoutes } from "@/lib/navigation";
import { useSession } from "@/lib/providers/session-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshSession } = useSession();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      // Get token from login function
      const token = await login(email, password);

      // Set the token in localStorage
      localStorage.setItem("authToken", token);

      // Let the session provider handle the token
      await refreshSession();

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LogoCard>
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input id="email" name="email" placeholder="Email" type="email" required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Input id="password" name="password" placeholder="Password" type="password" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" asChild>
              <Link href={NavigationRoutes.SIGNUP}>Sign Up</Link>
            </Button>
            <Button type="submit">Login</Button>
          </CardFooter>
        </form>
      </LogoCard>
    </div>
  );
}
