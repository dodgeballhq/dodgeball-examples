"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTransactions } from "@/lib/api/transactions/use-transactions";

interface TransactionsCardProps {}

const TransactionsCard = ({ }: TransactionsCardProps) => {
  const { data: transactions, isLoading, error } = useTransactions();
  console.log(transactions);
  const renderTableBody = () => {
    let message: string | null = null;
    if (isLoading) {
      message = "Loading...";
    }
    if (error) {
      message = "Unable to load transactions";
    }
    if (transactions?.transactions.length === 0) {
      message = "No transactions meeting your criteria";
    }
    if (message) {
      return <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{message}</TableCell></TableRow>;
    }

    return transactions?.transactions.map((transaction) => (
      <TableRow key={transaction.id}>
        <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>{transaction.fromDescription}</TableCell>
        <TableCell>{transaction.toDescription}</TableCell>
        <TableCell>{transaction.description}</TableCell>
        <TableCell>{transaction.amount.toFixed(2)} {transaction.currency}</TableCell>
      </TableRow>
    ));

  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableBody()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionsCard;
