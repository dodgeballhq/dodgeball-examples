"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getDummyConnectedAccountByName } from "@/lib/utils"
import { useState } from "react"
import InboundForm from "./inbound-form"
import OutboundForm from "./outbound-form"
import { useTransactionForm } from "./use-transaction-form"

export default function TransactionForm() {
  const { formData, updateFormData, submitTransaction, isSubmitting, error } = useTransactionForm()
  const [step, setStep] = useState(1)

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>What would you like to do?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={"default"}
                  onClick={() => {
                    updateFormData("type", "inbound")
                    nextStep()
                  }}
                >
                  Receive Money
                </Button>
                <Button
                  variant={"default"}
                  onClick={() => {
                    updateFormData("type", "outbound")
                    nextStep()
                  }}
                >
                  Send Money
                </Button>
              </div>
            </CardContent>
          </>
        )
      case 2:
        return formData.type === "inbound" ? (
        <InboundForm
            formData={formData}
            updateFormData={(key: string, value: string) => updateFormData(key as keyof typeof formData, value)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        ) : (
          <OutboundForm
            formData={formData}
            updateFormData={(key: string, value: string) => updateFormData(key as keyof typeof formData, value)}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        )
      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Confirm Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Direction:</strong> {formData.type}
                </p>
                <p>
                  <strong>Amount:</strong> ${formData.amount}
                </p>
                <p>
                  <strong>Currency:</strong> {formData.currency}
                </p>
                {formData.type === "inbound" && (
                  <>
                    <p>
                      <strong>Funding Source:</strong> {getDummyConnectedAccountByName(formData.connectedAccount ?? "")?.name ?? "Unknown"}
                    </p>
                    <p>
                      <strong>Account Number:</strong> {getDummyConnectedAccountByName(formData.connectedAccount ?? "")?.accountNumber ?? "Unknown"}
                    </p>
                    <p>
                      <strong>Routing Number:</strong> {getDummyConnectedAccountByName(formData.connectedAccount ?? "")?.routingNumber ?? "Unknown"}
                    </p>
                  </>
                )}
                {formData.type === "outbound" && (
                  <>
                    <p>
                      <strong>Recipient:</strong> {formData.bankName}
                    </p>
                    <p>
                      <strong>Account Number:</strong> {formData.accountNumber}
                    </p>
                    <p>
                      <strong>Routing Number:</strong> {formData.routingNumber}
                    </p>
                  </>
                )}
                <p>
                  <strong>Description:</strong> {formData.description}
                </p>
                <p>
                  <strong>Reference:</strong> {formData.reference}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={prevStep}>
                Back
              </Button>
              <Button onClick={submitTransaction} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Confirm Transaction"}
              </Button>
            </CardFooter>
          </>
        )
      default:
        return null
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      {renderStep()}
      {error && (
        <div className="pb-4 px-8">
          <p className="text-red-500 text-center">{error}</p>
        </div>
      )}
    </Card>
  )
}

