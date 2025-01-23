"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { TransactionsService } from "@/lib/api/transactions/service";
import { UsersService } from "@/lib/api/users/service";
import { processDodgeballVerification } from "@/lib/dodgeball-extensions/client-helpers";
import { IProcessClientVerification } from "@/lib/dodgeball-extensions/client-types";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { IVerification, IVerificationError } from "@dodgeball/trust-sdk-client/dist/types/types";
import { Transaction, User } from "@prisma/client";
import { IdCardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const router = useRouter();

  // Dodgeball State
  const [isVerifying, setIsVerifying] = useState(false);
  const { dodgeball } = useDodgeballProvider();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        router.push("/login");
        return;
      }

      try {
        const userResponse = await UsersService.getUser(userId);
        setUser(userResponse.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      }

      try {
        const transactions = await TransactionsService.getTransactions(userId);
        setUserTransactions(transactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const handleVerifyId = async () => {
    setIsVerifying(true);
    if (!user) return;

    const onApproved = async (verification: IVerification) => {
      console.log("Checkpoint approved", verification);
      const updatedUser = await UsersService.updateUser(user.id, { isVerified: true });
      setUser(updatedUser.user);
      toast({
        title: "Success",
        description: "Your ID has been verified successfully",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    const onDenied = async (verification: IVerification) => {
      console.log("Checkpoint denied", verification);
      toast({
        variant: "destructive",
        title: "ID Verification Unsuccessful",
        description: "Your ID was not verified",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    const onError = async (error: IVerificationError) => {
      console.error("Checkpoint error", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your ID",
        duration: 3000,
      });
      setIsVerifying(false);
    };

    try {
      const params: IProcessClientVerification = {
        dodgeball,
        internalEndpoint: "api/checkpoint",
        clientVerification: {
          checkpointName: "VERIFY_ID",
          userId: user.email,
          payload: {
            customer: {
              firstName: user.firstName,
              lastName: user.lastName,
              primaryEmail: user.email,
            },
          },
        },
        callbacks: {
          onApproved,
          onDenied,
          onError,
        },
      };
      const checkpointResult = await processDodgeballVerification(params);
      console.log("Checkpoint result", checkpointResult);
    } catch (error) {
      console.error("Error verifying ID:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while verifying your ID",
        duration: 3000,
      });
      setIsVerifying(false);
    }
  };

  const handleResetVerification = async () => {
    if (!user) return;

    try {
      const updatedUser = await UsersService.updateUser(user.id, { isVerified: false });
      setUser(updatedUser.user);
      toast({
        title: "Success",
        description: "Your verification has been reset",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error resetting verification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while resetting your verification",
        duration: 3000,
      });
    }
  };

  const renderVerificationAction = () => {
    if (isVerifying) {
      return (
        <div className="flex flex-col gap-2">
          <div className="text-sm text-gray-500">Verifying your identity...</div>
        </div>
      );
    }

    if (!user) return null;

    if (!user.isVerified) {
      return (
        <div className="flex flex-col gap-2">
          <Button variant="default" size="sm" onClick={handleVerifyId}>
            Verify your Identity
          </Button>
          <div className="text-sm text-gray-500">This will allow you to make transactions</div>
        </div>
      );
    }

    return (
      <Button variant="outline" size="sm" onClick={handleResetVerification}>
        Reset Verification
      </Button>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <img src="/finfire-wide.svg" alt="FinFire" className="h-12 w-auto mb-4" />
          <h1 className="text-3xl font-bold">Welcome, {user.firstName}!</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col justify-center gap-1">
                <div className="flex gap-2 items-center">
                  <strong>Name:</strong> {user.firstName} {user.lastName}
                  {user.isVerified && (
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger>
                        <div className="bg-cyan-200 px-1 py-0.5 rounded">
                          <IdCardIcon className="w-5 h-5 text-cyan-900" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Account is ID verified</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div className="mt-2">{renderVerificationAction()}</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">${user.balance?.toFixed(2)}</p>
            </CardContent>
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
    </div>
  );
}
