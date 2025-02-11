import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dummyConnectedAccounts = [
  {
    name: "Risky Bank",
    accountNumber: "1111111111",
    routingNumber: "111111111",
  },
  {
    name: "Safe Bank",
    accountNumber: "2222222222",
    routingNumber: "222222222",
  },
  {
    name: "Other Bank",
    accountNumber: "3333333333",
    routingNumber: "333333333",
  },
];

export const getDummyConnectedAccountByName = (name: string) => {
  return dummyConnectedAccounts.find((account) => account.name === name);
};
