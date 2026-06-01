"use client";

import { useLogin } from "../hooks/useLogin";
import { Input, Button } from "@/shared/ui"; 
import { useEffect } from "react";
import Link from "next/link";

export function LoginForm() {
  const { 
    form, 
    step, 
    isLoading, 
    isSuccess, 
    serverError, 
    handleEmailNext, 
    onSubmit, 
    resetToEmail,
    isOnline
  } = useLogin();

  const { register, formState: { errors }, watch } = form;
  const emailValue = watch("email");

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 animate-fade-in text-center transition-all duration-500">
        <div className="w-16 h-16 rounded-full bg-primary text-inverse flex items-center justify-center mb-2 shadow-elevated">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-primary">Успешный вход!</p>
      </div>
    );
  }

  return (
    <div className="grid relative">
      
      {/* Премиальный баннер ошибки подключения */}
      {!isOnline && (
        <div className="bg-danger/10 border border-danger/20 text-danger rounded-2xl px-4 py-3 text-sm mb-4 animate-fade-in flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0 text-danger animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold text-xs uppercase tracking-wider">Сервер недоступен</p>
            <p className="text-xs text-danger/80 mt-0.5">Пожалуйста, запустите Java-бэкенд.</p>
          </div>
        </div>
      )}

      <div 
        className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-out ${
          step === "email" 
            ? "relative opacity-100 translate-y-0 scale-100 z-10" 
            : "absolute opacity-0 -translate-y-6 scale-[0.96] pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-3">
          <Button 
            type="button" 
            disabled={true}
            onClick={() => alert("Авторизация через Google пока не доступна")}
            className="w-full h-12 rounded-full bg-primary text-inverse hover:bg-primary/90 flex items-center justify-center gap-3 font-medium text-sm transition-colors border-0 mb-6 cursor-pointer opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Продолжить с Google
          </Button>

          <Input
            type="email"
            placeholder="введите вашу почту"
            {...register("email")}
            disabled={!isOnline}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (isOnline) handleEmailNext();
              }
            }}
            error={errors.email?.message}
            autoComplete="email"
            className="h-12 rounded-xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                <rect x="3" y="5" width="18" height="14" rx="2" ry="2"/>
                <polyline points="3 7 12 13 21 7"/>
              </svg>
            }
          />

          <Button 
            type="button" 
            onClick={handleEmailNext}
            disabled={!isOnline || !emailValue}
            className={`w-full h-12 rounded-full transition-colors text-sm font-medium border-0 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              emailValue && isOnline
                ? "bg-primary text-inverse hover:bg-primary/90" 
                : "bg-surface-secondary text-secondary/60"
            }`}
          >
            Продолжить с почтой
          </Button>
        </div>
      </div>

      <div 
        className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-out ${
          step === "password" 
            ? "relative opacity-100 translate-y-0 scale-100 z-10 delay-75" 
            : "absolute opacity-0 translate-y-6 scale-[0.96] pointer-events-none"
        }`}
      >
        <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
          {serverError && (
            <div className="bg-surface border border-border text-primary rounded-2xl px-4 py-3 text-sm mb-2 shadow-elevated">
              {serverError}
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 bg-surface-secondary rounded-2xl border border-border mb-2">
            <span className="text-sm text-primary truncate pr-2">{emailValue}</span>
            <Button 
              type="button" 
              variant="ghost"
              size="sm"
              disabled={!isOnline}
              onClick={resetToEmail}
              className="whitespace-nowrap px-2"
            >
              Изменить
            </Button>
          </div>

          <Input
            type="password"
            placeholder="введите пароль"
            {...register("password")}
            disabled={!isOnline}
            error={errors.password?.message}
            autoComplete="current-password"
            className="h-11.5 rounded-2xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
            leftIcon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          <Button 
            type="submit" 
            isLoading={isLoading} 
            disabled={!isOnline}
            className="w-full h-12 rounded-full bg-primary text-inverse hover:bg-primary/90 transition-colors text-sm font-medium border-0 mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Входим..." : "Войти"}
          </Button>
        </form>
      </div>

      <div className="mt-6 text-center">
        <span className="text-secondary text-sm">Нет аккаунта? </span>
        <Link href="/register" className="text-primary text-sm hover:underline transition-all font-medium">
          Зарегистрироваться
        </Link>
      </div>
    </div>
  );
}