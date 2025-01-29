"use client";

import { EmailVerificationBadge } from "@/components/custom/reusable/email-verification-badge.tsx";
import { IdVerificationBadge } from "@/components/custom/reusable/id-verification-badge";
import { PhoneVerificationBadge } from "@/components/custom/reusable/phone-verification-badge.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useBalances, useUser } from "@/lib/api/users/use-user";
import Link from "next/link";
import TransactionsCard from "../transactions/transactions-card";

export default function Dashboard() {
  const { data: userData } = useUser();
  const { data: balances } = useBalances();

  const renderAvailableBalances = () => {
    if (!balances) return null;
    for (const [currency, balance] of Object.entries(balances)) {
      return (
        <div className="flex justify-between items-center font-bold text-3xl" key={`balance-${currency}`}>
          <p>{balance} {currency}</p>
        </div>
      )
    }
    return null;
  };
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {userData?.user?.firstName}!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <div className="flex gap-2 justify-between items-center leading-none">
                <p>Email</p>
                <EmailVerificationBadge />
              </div>
              <div className="flex gap-2 justify-between items-center leading-none">
                <p>Phone</p>
                <PhoneVerificationBadge />
              </div>
              <div className="flex gap-2 justify-between items-center leading-none">
                <p>Government ID</p>
                <IdVerificationBadge showText={true} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {renderAvailableBalances()}
              <p className="text-muted-foreground">Available Balances</p>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/transactions/create">
              <Button variant="outline" size="sm">
                Add Funds
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
      <TransactionsCard />
    </div>
  );
}
