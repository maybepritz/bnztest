"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { approveVerificationAction, rejectVerificationAction } from "./actions";

interface Props {
  requestId: string;
}

export function VerificationActions({ requestId }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    setIsLoading(true);
    const res = await approveVerificationAction(requestId);
    if (!res.success) alert(res.error);
    setIsLoading(false);
  };

  const handleReject = async () => {
    if (!window.confirm("Вы уверены, что хотите отклонить эту заявку?")) return;
    setIsLoading(true);
    const res = await rejectVerificationAction(requestId);
    if (!res.success) alert(res.error);
    setIsLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleApprove}
        disabled={isLoading}
        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50" 
        title="Принять"
      >
        <Check size={18} strokeWidth={2.5} />
      </button>
      <button 
        onClick={handleReject}
        disabled={isLoading}
        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50" 
        title="Отклонить"
      >
        <X size={18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
