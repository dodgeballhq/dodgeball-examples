import LogoCard from "@/components/custom/logo-card";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersService } from "@/lib/api/users/service";
import SignupForm from "./signup-form";

export default async function Signup() {
  const processSignup = async (firstName: string, lastName: string, email: string, password: string) => {
    "use server";
    const response = await UsersService.createUser({ firstName, lastName, email, password });
    console.log(response);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LogoCard>
        <CardHeader>
          <CardTitle>Sign Up for FinFire</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <SignupForm processSignup={processSignup} />
      </LogoCard>
    </div>
  );
}
