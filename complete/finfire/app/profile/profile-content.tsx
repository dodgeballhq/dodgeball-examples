"use client";

import { EmailVerificationBadge } from "@/components/custom/reusable/email-verification-badge.tsx";
import { IdVerificationBadge } from "@/components/custom/reusable/id-verification-badge";
import { PhoneVerificationBadge } from "@/components/custom/reusable/phone-verification-badge.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { UpdateUserRequest, updateUserRequestSchema } from "@/lib/api/users/types";
import { useSession } from "@/lib/providers/session-provider";
import { useState } from "react";
import { z } from "zod";

interface ProfileContentProps {
  updateUser: (userId: string, user: UpdateUserRequest) => Promise<any>;
}

interface ProfileField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  badge?: React.ReactNode;
  value: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ updateUser }) => {
  const [hasChanged, setHasChanged] = useState(false);
  const { sessionUser, refreshSession } = useSession();
  if (!sessionUser) return null;

  const profileFields: ProfileField[] = [
    {
      id: "firstName",
      label: "Name",
      type: "text",
      placeholder: "First Name",
      value: sessionUser?.firstName ?? "",
    },
    {
      id: "lastName",
      label: "", // Empty label since it's part of the Name section
      type: "text",
      placeholder: "Last Name",
      value: sessionUser?.lastName ?? "",
    },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "Email",
      badge: <EmailVerificationBadge />,
      value: sessionUser?.email ?? "",
    },
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "Phone",
      badge: <PhoneVerificationBadge />,
      value: sessionUser?.phone ?? "",
    },
  ];

  const handleSubmitSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updatePayload = {
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        phone: (formData.get("phone") as string) || undefined,
      };

      // Validate the payload using the Zod schema
      const validatedPayload = updateUserRequestSchema.parse(updatePayload);

      await updateUser(sessionUser?.id, validatedPayload);
      await refreshSession();
      console.log("Profile updated successfully");
      setHasChanged(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        console.error("Validation error:", error.errors);
        // You could show these errors in the UI using toast or other notification system
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: error.errors.map((e) => e.message).join(", "),
          duration: 3000,
        });
      } else {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update profile",
          duration: 3000,
        });
      }
    }
  };

  const renderField = (field: ProfileField) => (
    <Input
      key={field.id}
      className=""
      onChange={() => setHasChanged(true)}
      defaultValue={field.value}
      id={field.id}
      name={field.id}
      placeholder={field.placeholder}
      type={field.type}
      required
    />
  );

  return (
    <form onSubmit={handleSubmitSaveProfile}>
      <div className="flex flex-col justify-center gap-4">
        {/* Name section (special case for first/last name) */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <strong>Name</strong>
          </div>
          <div className="flex flex-col gap-2">
            {renderField(profileFields[0])}
            {renderField(profileFields[1])}
          </div>
        </div>

        {/* Other fields */}
        {profileFields.slice(2).map((field) => (
          <div key={field.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
              <strong>{field.label}</strong>
              {field.badge}
            </div>
            {renderField(field)}
          </div>
        ))}

        {/* ID Verification section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
            <strong>ID Verification</strong>
            <IdVerificationBadge />
          </div>
        </div>

        <Button type="submit" disabled={!hasChanged}>
          Save Profile
        </Button>
      </div>
    </form>
  );
};
