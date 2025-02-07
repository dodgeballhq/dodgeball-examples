import LogoCard from "@/components/custom/logo-card";
import { Button } from "@/components/ui/button";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationRoutes } from "@/lib/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <LogoCard>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Get Ready to Shop</CardTitle>
          <CardDescription>Welcome to ultimate shopping experience</CardDescription>
        </CardHeader>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={NavigationRoutes.SIGNUP}>Sign Up</Link>
            </Button>
          </div>
        </CardFooter>
      </LogoCard>
    </div>
  );
}
