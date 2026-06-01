"use client";

import { useState } from "react";
import { verifyAdminCodeAction } from "./actions";
import { Button, InputOTP } from "@/shared/ui";
import { ShieldAlert } from "lucide-react";

export function AdminAuth() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await verifyAdminCodeAction(code);
    if (res.success) {
      alert("Успешно! Теперь вы АДМИНИСТРАТОР. Пожалуйста, войдите в аккаунт заново для обновления данных.");
      localStorage.removeItem("user");
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'logout' })
      });
      window.location.href = "/login";
    } else {
      setError(res.error || "Неверный код");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-fade-in">
      <div className="bg-surface border border-border shadow-elevated rounded-2xl p-8 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2 text-center">Доступ ограничен</h1>
        <p className="text-secondary text-center mb-8">
          У вас нет прав администратора. Введите 6-значный код подтверждения, отправленный вам другим администратором.
        </p>

        <form onSubmit={handleVerify} className="w-full flex flex-col gap-6">
          <InputOTP 
            value={code} 
            onChange={setCode} 
            maxLength={6}
          />
          {error && <div className="text-danger text-sm text-center font-medium bg-danger/10 p-2 rounded-lg">{error}</div>}
          <Button type="submit" disabled={loading || code.length !== 6} className="w-full py-3">
            {loading ? "Проверка..." : "Подтвердить"}
          </Button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-secondary">
          <a href="/" className="hover:text-primary transition-colors">Вернуться в приложение</a>
        </div>
      </div>
    </div>
  );
}
