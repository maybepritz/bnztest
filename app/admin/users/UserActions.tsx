"use client";

import { Trash2, Shield, ShieldOff, Key } from "lucide-react";
import { deleteUserAction, toggleVerifyUserAction } from "./actions";
import { useState } from "react";

export function UserActions({ userId, isVerified }: { userId: string, isVerified: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя? Это действие необратимо.")) return;
    setLoading(true);
    await deleteUserAction(userId);
    setLoading(false);
  };

  const handleVerify = async () => {
    setLoading(true);
    await toggleVerifyUserAction(userId);
    setLoading(false);
  };

  const handleSendAdminCode = async () => {
    if (!confirm("Сгенерировать и отправить код приглашения администратора на email этого пользователя?")) return;
    setLoading(true);
    const { sendAdminCodeAction } = await import("./actions");
    const res = await sendAdminCodeAction(userId);
    if (res.success) {
      alert("Код успешно сгенерирован и отправлен!");
    } else {
      alert(res.error || "Произошла ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleSendAdminCode}
        disabled={loading}
        className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50" 
        title="Отправить код админа"
      >
        <Key size={16} />
      </button>

      <button 
        onClick={handleVerify}
        disabled={loading}
        className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
          isVerified 
            ? "text-yellow-500 hover:bg-yellow-500/10" 
            : "text-green-500 hover:bg-green-500/10"
        }`} 
        title={isVerified ? "Забрать галочку" : "Выдать галочку"}
      >
        {isVerified ? <ShieldOff size={16} /> : <Shield size={16} />}
      </button>

      <button 
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors disabled:opacity-50" 
        title="Удалить пользователя"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
