"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BaseTransactionFields, baseTransactionSchema } from "./base-transaction-form";

const schema = baseTransactionSchema.extend({
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  routingNumber: z.string().min(1, "Routing number is required"),
});

interface OutboundFormProps {
  formData: any
  updateFormData: (key: string, value: string) => void
  nextStep: () => void
  prevStep: () => void
}

export default function OutboundForm({ formData, updateFormData, nextStep, prevStep }: OutboundFormProps) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (values: z.infer<typeof schema>) => {
    Object.entries(values).forEach(([key, value]) => {
      updateFormData(key, value.toString())
    })
    nextStep()
  }

  return (
    <>
      <CardHeader>
        <CardTitle>Send Money</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Bank*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Account Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Routing Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter routing number" {...field} />
                  </FormControl>
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
  )
}

