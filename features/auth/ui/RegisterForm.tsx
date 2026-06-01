"use client";

import { useRegister } from "../hooks/useRegister";
import { Input, Button } from "@/shared/ui";
import { useEffect, useState } from "react";
import Link from "next/link";
import { OTPInput } from "input-otp";

export function RegisterForm() {
  const {
    form,
    step,
    isLoading,
    isSuccess,
    serverError,
    handleCredentialsSubmit,
    handleVerificationSubmit,
    handleBack,
    usernameCheck,
    onSubmit,
    isOnline
  } = useRegister();

  const { register, formState: { errors }, watch, setValue } = form;

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
        <p className="text-lg font-medium text-primary">Регистрация успешна!</p>
        <p className="text-sm text-secondary">Входим в систему...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8 w-full">
        <div className="flex justify-between text-xs text-secondary mb-2 px-1 font-medium tracking-wider uppercase">
          <span className={step === "credentials" ? "text-primary transition-colors" : ""}>Аккаунт</span>
          <span className={step === "verification" ? "text-primary transition-colors" : ""}>Проверка</span>
          <span className={step === "profile" ? "text-primary transition-colors" : ""}>Профиль</span>
        </div>
        <div className="h-1 w-full bg-border-color rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: step === "credentials" ? "33%" : step === "verification" ? "66%" : "100%" }}
          />
        </div>
      </div>

      <div className="w-full">
        {/* Премиальный баннер ошибки подключения */}
        {!isOnline && (
          <div className="bg-danger/10 border border-danger/20 text-danger rounded-2xl px-4 py-3 text-sm mb-4 animate-fade-in flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0 text-danger animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider">Сервер недоступен</p>
              <p className="text-xs text-danger/80 mt-0.5">Пожалуйста, запустите Java-бэкенд для регистрации.</p>
            </div>
          </div>
        )}

        {serverError && (
          <div className="bg-surface border border-border text-primary rounded-md px-4 py-3 text-sm mb-4 animate-fade-in shadow-elevated">
            {serverError}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); }} className="grid w-full relative" noValidate>
          <div
            className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-out flex flex-col gap-3 ${step === "credentials"
                ? "relative opacity-100 translate-x-0 z-10"
                : "absolute opacity-0 -translate-x-full pointer-events-none"
              }`}
          >
            <Input
              type="email"
              placeholder="Email адрес"
              {...register("email")}
              disabled={!isOnline}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (isOnline) handleCredentialsSubmit();
                }
              }}
              error={errors.email?.message}
              autoComplete="email"
              className="h-11.5 rounded-2xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                  <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
              }
            />

            <Input
              type="password"
              placeholder="Придумайте пароль"
              {...register("password")}
              disabled={!isOnline}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (isOnline) handleCredentialsSubmit();
                }
              }}
              error={errors.password?.message}
              autoComplete="new-password"
              className="h-12 rounded-xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />

            <Button
              type="button"
              onClick={handleCredentialsSubmit}
              isLoading={isLoading}
              disabled={!isOnline}
              className="w-full h-12 rounded-full bg-primary text-inverse hover:bg-primary/90 transition-colors text-sm font-medium border-0 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Далее
            </Button>
          </div>

          <div
            className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-out flex flex-col gap-3 ${step === "verification"
                ? "relative opacity-100 translate-x-0 z-10"
                : step === "credentials" ? "absolute opacity-0 translate-x-full pointer-events-none" : "absolute opacity-0 -translate-x-full pointer-events-none"
              }`}
          >
            <div className="text-center mb-2">
              <h3 className="text-primary font-medium">Проверьте почту</h3>
              <p className="text-sm text-secondary mt-1">Мы отправили 6-значный код на ваш email.</p>
            </div>

            <div className="flex justify-center mt-2">
              <OTPInput
                maxLength={6}
                value={watch("code")}
                disabled={!isOnline}
                onChange={(val) => setValue("code", val, { shouldValidate: true })}
                render={({ slots }) => (
                  <div className="flex gap-2 justify-center w-full">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`
                          relative flex w-12 h-14 items-center justify-center text-2xl font-bold rounded-lg border transition-all
                          ${slot.isActive ? 'border-text-primary bg-surface-hover shadow-elevated' : 'border-border bg-surface-secondary'}
                        `}
                      >
                        {slot.char}
                        {slot.hasFakeCaret && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-pulse">
                            <div className="w-px h-6 bg-text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                onClick={handleBack}
                disabled={isLoading || !isOnline}
                className="flex-1 h-12 rounded-full bg-surface-secondary text-primary hover:bg-surface-hover transition-colors text-sm font-medium border border-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </Button>
              <Button
                type="button"
                onClick={handleVerificationSubmit}
                isLoading={isLoading}
                disabled={!isOnline}
                className="flex-[2] h-12 rounded-full bg-primary text-inverse hover:bg-primary/90 transition-colors text-sm font-medium border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Подтвердить
              </Button>
            </div>
          </div>

          <div
            className={`col-start-1 row-start-1 w-full transition-all duration-500 ease-out flex flex-col gap-3 ${step === "profile"
                ? "relative opacity-100 translate-x-0 z-10"
                : "absolute opacity-0 translate-x-full pointer-events-none"
              }`}
          >
            <Input
              type="text"
              placeholder="Как к вам обращаться? (Имя)"
              {...register("name")}
              disabled={!isOnline}
              error={errors.name?.message}
              autoComplete="name"
              className="h-11.5 rounded-2xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
            />

            <Input
              type="text"
              placeholder="Уникальный юзернейм (от 3 символов)"
              {...register("username")}
              disabled={!isOnline}
              error={errors.username?.message}
              autoComplete="off"
              className="h-11.5 rounded-2xl bg-surface-secondary border border-border text-primary placeholder:text-secondary/50 focus:border-text-primary focus:bg-surface-hover transition-colors disabled:opacity-50"
              leftIcon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              rightElement={
                usernameCheck.checking ? (
                  <span className="text-secondary text-sm">...</span>
                ) : usernameCheck.available === true ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : usernameCheck.available === false ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-danger">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : null
              }
            />
            {usernameCheck.message && !errors.username && (
              <p className={`text-xs px-1 -mt-1 ${usernameCheck.available ? 'text-success' : 'text-danger'}`}>
                {usernameCheck.message}
              </p>
            )}



            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                onClick={handleBack}
                disabled={isLoading || !isOnline}
                className="flex-1 h-12 rounded-full bg-surface-secondary text-primary hover:bg-surface-hover transition-colors text-sm font-medium border border-border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Назад
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                isLoading={isLoading}
                disabled={!isOnline}
                className="flex-2 h-12 rounded-full bg-primary text-inverse hover:bg-primary/90 transition-colors text-sm font-medium border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Завершить
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-6 text-center">
        <span className="text-secondary text-sm">Уже есть аккаунт? </span>
        <Link href="/login" className="text-primary text-sm hover:underline transition-all font-medium">
          Войти в систему
        </Link>
      </div>
    </div>
  );
}
