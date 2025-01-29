"use client";

import { toast } from "@/components/ui/use-toast";
import { useTransactions } from "@/lib/api/transactions/use-transactions";
import { useUser } from "@/lib/api/users/use-user";
import { authenticatedFetch } from "@/lib/auth";
import { processDodgeballVerification } from "@/lib/dodgeball-extensions/client-helpers";
import { IProcessClientVerification, IVerification, IVerificationError } from "@/lib/dodgeball-extensions/client-types";
import { ApiRoutes } from "@/lib/navigation";
import { useDodgeballProvider } from "@/lib/providers/dodgeball-provider";
import { getDummyConnectedAccountByName } from "@/lib/utils";
import { Transaction } from "@prisma/client";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FormData {
  type: "inbound" | "outbound";
  transactionId: string;
  amount: string;
  connectedAccount?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  reference: string;
  currency: string;
  description: string;
}

export function useTransactionForm() {
  const { dodgeball, sourceToken } = useDodgeballProvider();
  const { data: userData } = useUser();
  const { refetch: refetchTransactions } = useTransactions();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    type: "inbound",
    transactionId: `tr-${nanoid()}`,
    connectedAccount: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    amount: "",
    currency: "",
    description: "",
    reference: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onApproved = async (verification: IVerification) => {
    console.log("Verification:", verification);
    const userId = userData?.user?.id;
    if (!userId) {
      setError("User not found. Please try again.");
      return;
    }
    toast({
      title: "Transaction approved. Please wait for the transaction to complete.",
      variant: "default",
    });
    let toDescription = "";
    let fromDescription = "";
    if (formData.type === "inbound") {
      toDescription = "Self";
      fromDescription = formData.connectedAccount ?? "Unknown";
    } else {
      toDescription = `${formData.bankName ?? "Unknown"} - ******${formData.accountNumber?.slice(-4) ?? "Unknown"}`;
      fromDescription = "Self";
    }
    const transaction: Transaction = {
      id: formData.transactionId,
      amount: formData.type === "inbound" ? Number(formData.amount) : -Number(formData.amount),
      currency: formData.currency,
      toDescription,
      fromDescription,
      userId,
      description: formData.description,
      reference: formData.reference,
      createdAt: new Date(),
    };
    const response = await authenticatedFetch({
      method: "POST",
      route: ApiRoutes.TRANSACTION_CREATE,
      options: {
        body: JSON.stringify(transaction),
      },
    });
    if (response.ok) {
      router.push("/transactions");
      refetchTransactions();
    } else {
      setError("An error occurred while submitting the transaction. Please try again.");
    }
    setIsSubmitting(false);
  };

  const onDenied = async (verification: IVerification) => {
    console.log("Verification:", verification);
    setError("Transaction denied. Please try again.");
    setIsSubmitting(false);
  };

  const onError = async (error: IVerificationError) => {
    console.log("Verification:", error);
    setError("An error occurred while verifying the transaction. Please try again.");
    setIsSubmitting(false);
  };

  const updateFormData = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const submitTransaction = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      console.log("Transaction submitted:", formData);
      const connectedAccount = getDummyConnectedAccountByName(formData.connectedAccount ?? "");
      const clientParams: IProcessClientVerification = {
        callbacks: {
          onApproved,
          onDenied,
          onError,
        },
        dodgeball: dodgeball,
        clientVerification: {
          checkpointName: "TRANSACTION",
          sourceToken: sourceToken,
          userId: userData?.user?.id,
          sessionId: userData?.session?.id,
          payload: {
            finfire: {
              transaction: {
                formData,
              },
            },
            transaction: {
              externalId: formData.transactionId,
              amount: Number(formData.amount) * 100,
              currency: formData.currency,
              toAccount: formData.type === "inbound" ? connectedAccount?.accountNumber ?? null : formData.accountNumber,
            },
            paymentMethod: {
              type: "WIRE_DEBIT",
            },
            siftSendEventTransaction: {
              inputs: {
                brandName: "Finfire",
                siteDomain: "https://finfire.dodgeballhq.com",
                siteCountry: "US",
                transactionType: "$transfer",
              }
            }
          },
        },
      };
      processDodgeballVerification(clientParams);
    } catch (err) {
      console.error(err);
      setError("An error occurred while submitting the transaction. Please try again.");
      setIsSubmitting(false);
    }
  };

  return { formData, updateFormData, submitTransaction, isSubmitting, error };
}
