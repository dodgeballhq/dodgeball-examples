"use client";

import { EmailVerificationBadge } from "@/components/custom/reusable/email-verification-badge.tsx";
import { IdVerificationBadge } from "@/components/custom/reusable/id-verification-badge";
import { PhoneVerificationBadge } from "@/components/custom/reusable/phone-verification-badge.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionsService } from "@/lib/api/transactions/service";
import { useSession } from "@/lib/providers/session-provider";
import { Transaction } from "@prisma/client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const session = useSession();
  const sessionUser = session?.session?.user;

  useEffect(() => {
    const updateData = async () => {
      let transactionsToSet: Transaction[] = [];
      if (sessionUser?.id) {
        transactionsToSet = await TransactionsService.getTransactions(sessionUser.id);
      }
      setUserTransactions(transactionsToSet);
    };
    updateData();
  }, [sessionUser]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {sessionUser?.firstName}!</CardTitle>
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
              <p className="text-3xl font-bold">${sessionUser?.balance?.toFixed(2)}</p>
              <p className="text-muted-foreground">Available Balance</p>
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
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTransactions.length > 0 ? (
                userTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No transactions yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
