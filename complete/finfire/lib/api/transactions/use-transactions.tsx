import { authenticatedFetch } from "@/lib/auth";
import { ApiRoutes } from "@/lib/navigation";
import { useQuery } from "@tanstack/react-query";
import { TransactionsResponse } from "./types";

export async function getTransactions(): Promise<TransactionsResponse | null> {
  console.log("useTransactions: getTransactions");
  const response = await authenticatedFetch({
    route: ApiRoutes.TRANSACTIONS,
    method: "GET",
  });
  if (!response.ok) {
    return null;
  }
  const responseData: TransactionsResponse = await response.json();
  if (!responseData.transactions) {
    return null;
  }
  return responseData;
}

export const transactionsQueryKey = ["transactions"] as const;

export function useTransactions() {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: () => getTransactions(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
