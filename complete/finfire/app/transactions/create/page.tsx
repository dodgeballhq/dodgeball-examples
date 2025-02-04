import TransactionForm from "./transaction-form"

export default function CreateTransactionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Create Transaction</h1>
      <TransactionForm />
    </div>
  )
}

