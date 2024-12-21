"use client";
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL); // Replace with your backend URL

    socket.on('transaction:create', (newTransaction) => {
      setTransactions((prev) => [...prev, newTransaction]); // Add new transaction
    });

    socket.on('transaction:update', (updatedTransaction) => {
      setTransactions((prev) =>
        prev.map((transaction) =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        )
      ); // Update transaction
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div>
      <h1>Live Transactions</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.amount}</td>
              <td>{transaction.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
