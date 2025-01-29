"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

export const baseTransactionSchema = z.object({
  amount: z.coerce.number().min(1, "Amount is required"),
  description: z.string().optional().default("No Description Provided"),
  currency: z.string().min(1, "Currency is required"),
  reference: z.string().optional().default("No Reference Provided"),
});

export const BaseTransactionFields = ({ form }: { form: any }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="amount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Amount*</FormLabel>
            <FormControl>
              <Input type="number" placeholder="Enter amount" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency*</FormLabel>
            <FormControl>
              <Input placeholder="Enter currency (e.g., USD)" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input placeholder="Enter transaction description" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="reference"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reference Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter reference number" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};