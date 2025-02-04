"use server";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UsersService } from "@/lib/api/users/service";
import { UpdateUserRequest } from "@/lib/api/users/types";
import { EmailVerificationButton } from "./email-verification-button";
import { IdVerificationButton } from "./id-verification-button";
import { PhoneVerificationButton } from "./phone-verification-button";
import { ProfileContent } from "./profile-content";

export default async function ProfilePage() {
  const handleUpdateUser = async (userId: string, user: UpdateUserRequest) => {
    "use server";
    const updatedUser = await UsersService.updateUser(userId, user);
    return updatedUser;
  };

  return (
    <div className="grid grid-cols-[minmax(300px,_1fr)] md:grid-cols-[minmax(300px,_1fr)_minmax(300px,_1fr)] gap-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileContent updateUser={handleUpdateUser} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Profile Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <EmailVerificationButton updateUser={handleUpdateUser} />
            <PhoneVerificationButton updateUser={handleUpdateUser} />
            <IdVerificationButton updateUser={handleUpdateUser} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
