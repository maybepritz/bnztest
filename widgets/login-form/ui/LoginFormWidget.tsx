"use client";

import { LoginForm } from "@/features/auth";
import Link from "next/link";

export function LoginFormWidget() {
  return (
    <div className="w-full max-w-sm mx-auto grid gap-8">
      <div className="text-center">
        <Link
          href="/"
          className="font-black text-2xl tracking-tighter text-primary uppercase"
        >
          БНЗ
        </Link>
      </div>
      <div className="text-center animate-fade-in grid gap-3">
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Добро пожаловать
        </h1>
        <p className="text-xs text-secondary">
          Продолжая, вы соглашаетесь с нашей <a href="#" className="underline underline-offset-2 hover:text-primary transition-colors">политикой конфиденциальности</a>.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}