"use client";

import { IMeResponse } from "@/app/api/auth/me/route";
import LogoCard from "@/components/custom/logo-card";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@/lib/api/users/use-user";
import { authenticatedFetch } from "@/lib/auth";
import {
  getCustomMessageFromVerification,
  processDodgeballVerification,
} from "@/lib/dodgeball-extensions/client-helpers";
import { IProcessClientVerification, IVerification } from "@/lib/dodgeball-extensions/client-types";
import { ApiRoutes, NavigationRoutes } from "@/lib/navigation";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const { toast } = useToast();
  const { dodgeball, sourceToken } = useDodgeballProvider();
  const { data: userData, refetch: refetchUser, isLoading: isLoadingUser } = useUser();

  const getLogoutResponse = async () => {
    const res = await fetch(ApiRoutes.LOGOUT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: null,
    });
    if (res.ok) {
      console.log("Logout successful");
    } else {
      // handle error
      console.error("Logout failed");
    }
  };

  const getLoginResponse = async (email: string, password: string) => {
    const res = await fetch(ApiRoutes.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, sourceToken }),
    });
    return res;
  };

  const getMeResponse = async () => {
    const res = await authenticatedFetch({
      route: ApiRoutes.ME,
      method: "POST",
    });
    return res;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let email: string | null = null;
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const loginResponse = await getLoginResponse(email, password);
      let userData: IMeResponse | null = null;
      if (loginResponse.ok) {
        console.log("Ready for Dodgeball Login Flow");
        const userResponse = await getMeResponse();
        if (userResponse.ok) {
          userData = await userResponse.json();
          if (userData?.session?.id && userData?.user?.id) {
            console.log(
              "Running Dodgeball Track for sessionId",
              userData?.session?.id,
              "and userId",
              userData?.user?.id
            );
            await dodgeball?.track(userData?.session?.id, userData?.user?.id);
          }
        }
      } else {
        // handle error
        console.error("Invalid credentials");
      }

      const onApproved = async () => {
        console.log("Login approved");
        // Refetch user data using our centralized service
        await refetchUser();
        router.push("/dashboard");
      };

      const onDenied = async (verification: IVerification) => {
        console.log("Login denied");
        await getLogoutResponse();
        const customMessage = getCustomMessageFromVerification(verification);
        let deniedMessage = "We are sorry, but you are not authorized to access this application";
        if (typeof customMessage === "string") {
          deniedMessage = customMessage;
        }
        toast({
          title: "Login denied",
          description: deniedMessage,
          variant: "destructive",
        });
      };

      const onError = async () => {
        console.log("Login error");
        await onApproved();
      };

      if (!loginResponse.ok) {
        console.log("Failed Login - skipping checkpoint");
        return;
      }

      if (!userData) {
        console.log("No user data - skipping checkpoint");
        return;
      }

      if (!dodgeball) {
        console.log("Dodgeball is not initialized - skipping checkpoint");
        return;
      }

      try {
        const params: IProcessClientVerification = {
          dodgeball,
          clientVerification: {
            checkpointName: "LOGIN",
            payload: {
              sessionUser: userData,
              customer: {
                primaryEmail: userData?.user?.email,
                primaryPhone: userData?.user?.phone ?? null,
                firstName: userData?.user?.firstName ?? null,
                lastName: userData?.user?.lastName ?? null,
              },
            },
            sourceToken: sourceToken,
            sessionId: userData?.session?.id,
            userId: userData?.user?.id,
          },
          callbacks: {
            onApproved,
            onDenied,
            onError,
          },
        };
        await processDodgeballVerification(params);
      } catch (error) {
        console.error("Error Running Login Checkpoint:", error);
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "An unknown error occurred";
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
        <form onSubmit={onSubmit}>
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
            <Button type="submit" disabled={isLoadingUser}>
              Login
            </Button>
          </CardFooter>
        </form>
      </LogoCard>
    </div>
  );
}
