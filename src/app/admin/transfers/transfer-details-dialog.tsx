"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Transfer, getTransferInfo } from "./columns";
import { PhoneCall, Calendar, ArrowRightLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface TransferDetailsDialogProps {
  transfer: Transfer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferDetailsDialog({
  transfer,
  open,
  onOpenChange,
}: TransferDetailsDialogProps) {
  const transferInfo = getTransferInfo(transfer.transfer_type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfer Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transfer ID</p>
              <p className="font-medium">#{transfer.id}</p>
            </div>
            <Badge variant={transferInfo.variant} className={`${transferInfo.className}`}>
              {transferInfo.icon}
              <span className="ml-1">{transferInfo.label}</span>
            </Badge>
          </div>

          <Separator />

          {/* Main Content */}
          <div className="grid gap-6">
            {/* Time and Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{format(new Date(transfer.createdAt), "PPpp")}</span>
              </div>
            </div>

            {/* Transfer Flow */}
            <div className="grid gap-4">
              {/* From User */}
              <div className="grid gap-2">
                <span className="text-sm font-medium">From</span>
                <div className="rounded-lg border p-3 grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{transfer.shop_name}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <PhoneCall className="h-3 w-3" />
                      <span>+91 {transfer.mobile_number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* To User */}
              <div className="grid gap-2">
                <span className="text-sm font-medium">To</span>
                <div className="rounded-lg border p-3 grid gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{transfer.end_shop_name}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <PhoneCall className="h-3 w-3" />
                      <span>+91 {transfer.end_mobile_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amount Information */}
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <p className="text-lg font-semibold text-green-600">
                    ₹ {transfer.amount.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 border rounded-lg">
                  <span className="text-sm text-muted-foreground">Balance</span>
                  <p className="text-lg font-semibold text-blue-600">
                    ₹ {parseFloat(transfer.balance).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid gap-2">
              <span className="text-sm font-medium">Additional Details</span>
              <div className="rounded-lg border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">IP Address:</span>
                    <span className="ml-2 font-medium">{transfer.ip_address}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target Wallet:</span>
                    <span className="ml-2 font-medium">{transfer.target_wallet}</span>
                  </div>
                </div>
                <Separator />
                <div>
                  <span className="text-sm text-muted-foreground">Description</span>
                  <p className="mt-1">{transfer.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
