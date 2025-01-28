"use client";

import { useEffect, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { DataTable } from "./data-table";
import { ChevronDown, ChevronRight, RefreshCcw, History } from "lucide-react";
import { Transaction, transactionColumns } from "./columns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Types
interface MessageItem {
  type: 'status' | 'transaction' | 'request';
  timestamp: string;
  message: string;
  data?: any;
  expanded?: boolean;
}

// Socket configuration
const SOCKET_CONFIG = {
  transports: ['polling'],
  upgrade: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 2000,
  timeout: 10000,
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST",
  }
};

export default function LiveTransactions() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [socket, setSocket] = useState<Socket | null>(null);

  const addMessage = (type: MessageItem['type'], message: string, data?: any) => {
    setMessages(prev => [
      { type, timestamp: new Date().toLocaleTimeString(), message, data },
      ...prev.slice(0, 99)
    ]);
  };

  const toggleExpand = (index: number) => 
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, expanded: !msg.expanded } : msg
    ));

  const formatData = (data: any) => {
    if (!data) return null;
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex gap-2 items-start">
        <span className="font-medium min-w-[120px]">{key}:</span>
        <span className="text-gray-600">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </span>
      </div>
    ));
  };

  const initializeSocket = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "", {
      ...SOCKET_CONFIG,
      auth: { token: localStorage.getItem('token') }
    });

    // Socket event handlers
    const eventHandlers = {
      reconnect_error: (error: Error) => {
        addMessage('status', `Reconnection error: ${error.message}`);
        newSocket.io.opts.transports = ['polling'];
        newSocket.connect();
      },
      error: (error: Error) => {
        addMessage('status', `Socket error: ${error.message}`);
        newSocket.connect();
      },
      connect: () => {
        setConnectionStatus('Connected');
        addMessage('status', 'Socket connected');
        emitWithLog('getLoading'); // Add this line to request pending transactions on connect
      },
      connect_error: (error: Error) => {
        setConnectionStatus('Connection Error');
        addMessage('status', `Connection error: ${error.message}`);
      },
      disconnect: (reason: string) => {
        setConnectionStatus('Disconnected');
        addMessage('status', `Socket disconnected: ${reason}`);
      },
      reconnect: (attemptNumber: number) => {
        setConnectionStatus('Reconnected');
        addMessage('status', `Socket reconnected after ${attemptNumber} attempts`);
      },
      'transaction:update': (transaction: Transaction) => {
        addMessage('transaction', 'Transaction updated', transaction);
        setTransactions(prev => {
          const filtered = prev.filter(t => t.id === transaction.id || t.status < 10);
          const existingIndex = filtered.findIndex(t => t.id === transaction.id);
          return existingIndex >= 0
            ? filtered.map((t, i) => i === existingIndex ? transaction : t)
            : [transaction, ...filtered];
        });
      },
      'pendingTransactions': (pendingTransactions: Transaction[]) => {
        addMessage('status', `Received ${pendingTransactions.length} pending transactions`);
        setTransactions(prev => {
          const updatedTransactions = [...prev];
          
          pendingTransactions.forEach(newTransaction => {
            const existingIndex = updatedTransactions.findIndex(t => t.id === newTransaction.id);
            if (existingIndex >= 0) {
              // Update existing transaction
              updatedTransactions[existingIndex] = newTransaction;
            } else {
              // Add new transaction
              updatedTransactions.unshift(newTransaction);
            }
          });

          // Filter out completed transactions and keep only the most recent ones
          return updatedTransactions
            .filter(t => t.status < 10)
            .slice(0, 100); // Optional: limit to last 100 transactions
        });
      }
    };

    // Attach event handlers
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      newSocket.on(event, handler);
    });

    const emitWithLog = (eventName: string, data?: any) => {
      addMessage('status', `Sent ${eventName} request`, data);
      newSocket.emit(eventName, data);
    };

    setSocket(newSocket);
    return newSocket;
  }, []);

  const handleReconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket.removeAllListeners();
      setSocket(null);
    }
    initializeSocket();
    addMessage('status', 'Manual reconnection initiated');
  }, [socket, initializeSocket]);

  const handleLoadPendings = useCallback(() => {
    if (socket) {
      socket.emit('getLoading');
      addMessage('status', 'Sent getLoading request', { timestamp: new Date().toISOString() });
    }
  }, [socket]);

  useEffect(() => {
    const socket = initializeSocket();
    const messageCleanup = setInterval(() => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      setMessages(prev => prev.filter(msg => {
        const msgTime = new Date(msg.timestamp);
        return msgTime > thirtyMinutesAgo;
      }));
    }, 5 * 60 * 1000);

    const transactionCleanup = setInterval(() => {
      setTransactions(prev => prev.filter(t => t.status < 10));
    }, 60 * 1000);

    return () => {
      clearInterval(messageCleanup);
      clearInterval(transactionCleanup);
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [initializeSocket]);

  return (
    <div className="h-full">
      <Card>
        {/* Header Section */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h1 className="text-2xl font-bold">Live Transactions Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Monitor real-time transactions and system events
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                connectionStatus === 'Connected' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {connectionStatus}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Reconnect
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadPendings}
              className="flex items-center gap-2"
            >
              <RefreshCcw size={16} />
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <History size={16} />
                  Event Log
                  {messages.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs bg-secondary rounded-full">
                      {messages.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Event Log</DialogTitle>
                </DialogHeader>
                <div className="divide-y overflow-y-auto max-h-[calc(80vh-120px)]">
                  {messages.map((msg, index) => (
                    <div 
                      key={index} 
                      className="p-3 hover:bg-secondary/10 cursor-pointer transition-colors"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {msg.data ? (
                            msg.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                          ) : null}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            msg.type === 'status' 
                              ? 'bg-blue-100 text-blue-700' 
                              : msg.type === 'request'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {msg.type}
                          </span>
                          <span className="text-sm font-medium">{msg.message}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      
                      {msg.data && msg.expanded && (
                        <div className="mt-2 ml-6 p-2 bg-secondary/10 rounded text-xs space-y-1">
                          {formatData(msg.data)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="relative">
          <DataTable 
            columns={transactionColumns} 
            data={transactions} 
          />
          {transactions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50">
              <p className="text-muted-foreground">Waiting for transactions...</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
