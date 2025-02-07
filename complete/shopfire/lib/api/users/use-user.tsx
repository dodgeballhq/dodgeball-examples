import { IMeResponse } from "@/app/api/auth/me/route";
import { IBalancesResponse } from "@/app/api/balances/route";
import { authenticatedFetch } from "@/lib/auth";
import { ApiRoutes } from "@/lib/navigation";
import { useQuery } from "@tanstack/react-query";

export async function getAuthenticatedUser(): Promise<IMeResponse | null> {
  console.log("useUser: getAuthenticatedUser");
  const response = await authenticatedFetch({
    route: ApiRoutes.ME,
    method: "POST",
  });
  if (!response.ok) {
    return null;
  }
  const responseData: IMeResponse = await response.json();
  if (!responseData.user) {
    return null;
  }
  return responseData;
}

export const userQueryKey = ["user"] as const;

export function useUser() {
  return useQuery({
    queryKey: userQueryKey,
    queryFn: () => getAuthenticatedUser(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export const balancesQueryKey = ["balances"] as const;

export async function getBalances(userId: string): Promise<IBalancesResponse | null> {
  const response = await authenticatedFetch({
    route: ApiRoutes.BALANCES,
    method: "GET",
  });
  if (!response.ok) {
    return null;
  }
  const responseData: IBalancesResponse = await response.json();
  return responseData;
}

