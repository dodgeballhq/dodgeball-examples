"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyConnectedAccounts } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BaseTransactionFields, baseTransactionSchema } from "./base-transaction-form";

const schema = baseTransactionSchema.extend({
  connectedAccount: z.string().min(1, "Connected account is required"),
});

type FormValues = z.infer<typeof schema>;

interface InboundFormProps {
  formData: any;
  updateFormData: (key: string, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
}

export default function InboundForm({ formData, updateFormData, nextStep, prevStep }: InboundFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => {
    Object.entries(values).forEach(([key, value]) => {
      updateFormData(key, value.toString());
    });
    nextStep();
  };

  const connectedAccounts = dummyConnectedAccounts.map((account) => account.name);

  return (
    <>
      <CardHeader>
        <CardTitle>Receive Money</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="connectedAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {connectedAccounts.map((account) => (
                        <SelectItem key={account} value={account}>
                          {account}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <BaseTransactionFields form={form} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep} type="button">
              Back
            </Button>
            <Button type="submit">Next</Button>
          </CardFooter>
        </form>
      </Form>
    </>
  );
}

