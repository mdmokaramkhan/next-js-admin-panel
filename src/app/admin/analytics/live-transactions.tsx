"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import type { Transaction } from "./columns";
import { ChevronDown, ChevronRight } from "lucide-react";

interface MessageItem {
  type: 'status' | 'transaction';
  timestamp: string;
  message: string;
  data?: any;
  expanded?: boolean;
}

export default function LiveTransactions() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  const addMessage = (type: MessageItem['type'], message: string, data?: any) => {
    setMessages(prev => [{
      type,
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    }, ...prev]);
  };

  const toggleExpand = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, expanded: !msg.expanded } : msg
    ));
  };

  const formatData = (data: any) => {
    if (!data) return null;
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="flex gap-2 items-start">
        <span className="font-medium min-w-[120px]">{key}:</span>
        <span className="text-gray-600">{
          typeof value === 'object' 
            ? JSON.stringify(value, null, 2) 
            : String(value)
        }</span>
      </div>
    ));
  };

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL || "", {
      transports: ['polling'], // Start with polling only
      upgrade: false, // Disable automatic upgrade to WebSocket
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
      timeout: 10000,
      auth: {
        // Add any required auth headers
        token: localStorage.getItem('token') // if you have auth
      },
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST",
      }
    });

    socket.io.on("ping", () => {
      addMessage('status', 'Ping sent to server');
    });

    socket.io.on("reconnect_error", (error) => {
      addMessage('status', `Reconnection error: ${error.message}`);
      // Try to reinitialize connection with different settings
      socket.io.opts.transports = ['polling'];
      socket.connect();
    });

    socket.on("error", (error) => {
      addMessage('status', `Socket error: ${error.message}`);
      // Force reconnection on error
      socket.connect();
    });

    socket.on("connect", () => {
      setConnectionStatus('Connected');
      addMessage('status', 'Socket connected');
    });

    socket.on("connect_error", (error) => {
      setConnectionStatus('Connection Error');
      addMessage('status', `Connection error: ${error.message}`);
    });

    socket.on("disconnect", (reason) => {
      setConnectionStatus('Disconnected');
      addMessage('status', `Socket disconnected: ${reason}`);
    });

    socket.on("reconnect", (attemptNumber) => {
      setConnectionStatus('Reconnected');
      addMessage('status', `Socket reconnected after ${attemptNumber} attempts`);
    });

    socket.on("transaction:create", (transaction: Transaction) => {
      addMessage('transaction', 'New transaction received', transaction);
    });

    socket.on("transaction:update", (transaction: Transaction) => {
      addMessage('transaction', 'Transaction updated', transaction);
    });

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      socket.removeAllListeners();
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="text-lg font-bold flex items-center justify-between">
        <div>
          Socket Status: 
          <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
            connectionStatus === 'Connected' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {connectionStatus}
          </span>
        </div>
      </div>
      <div className="border rounded-lg divide-y">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className="p-2 hover:bg-gray-50 cursor-pointer"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {msg.data ? (
                  msg.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : null}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  msg.type === 'status' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {msg.type}
                </span>
                <span className="font-medium">{msg.message}</span>
              </div>
              <span className="text-xs text-gray-500">{msg.timestamp}</span>
            </div>
            
            {msg.data && msg.expanded && (
              <div className="mt-2 ml-6 p-2 bg-gray-50 rounded text-xs space-y-1">
                {formatData(msg.data)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
