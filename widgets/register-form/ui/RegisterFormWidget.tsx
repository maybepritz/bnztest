import { RegisterForm } from "@/features/auth";
import Link from "next/link";

export function RegisterFormWidget() {
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
      <div className="text-center animate-fade-in transition-all duration-500 grid gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Создать аккаунт</h1>
        <p className="text-secondary text-sm">Заполните данные для регистрации</p>
      </div>

      <RegisterForm />
    </div>
  );
}
