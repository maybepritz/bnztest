
import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData, credentialsSchema } from "@/entities/user/schema";

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Периодическая проверка подключения к бэкенду
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/auth/check-username?q=health_check_ping");
        setIsOnline(res.status !== 502 && res.status !== 503 && res.status !== 504);
      } catch (e) {
        setIsOnline(false);
      }
    }
    
    checkConnection();
    const interval = setInterval(checkConnection, 4000);
    return () => clearInterval(interval);
  }, []);
  
  const [usernameCheck, setUsernameCheck] = useState<{ checking: boolean; available: boolean | null; message: string }>({
    checking: false,
    available: null,
    message: "",
  });
  
  const [step, setStep] = useState<"credentials" | "verification" | "profile">("credentials");

  // Расширяем тип формы полем code (оно нужно только на шаге verification)
  const form = useForm<RegisterFormData & { code: string }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      code: "",
      
    },
  });

  const usernameValue = form.watch("username");

  
  useEffect(() => {
    if (!usernameValue || usernameValue.length < 3) {
      setUsernameCheck({ checking: false, available: null, message: "" });
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setUsernameCheck(prev => ({ ...prev, checking: true, message: "Проверка..." }));
      try {
        const res = await fetch(`/api/auth/check-username?q=${encodeURIComponent(usernameValue)}`);
        const data = await res.json();
        setUsernameCheck({
          checking: false,
          available: data.available,
          message: data.message,
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        setUsernameCheck({ checking: false, available: null, message: "Ошибка проверки" });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [usernameValue]);

  async function handleCredentialsSubmit() {
    const values = form.getValues();
    const result = credentialsSchema.safeParse({
      email: values.email,
      password: values.password,
    });

    if (!result.success) {
      form.clearErrors("email");
      form.clearErrors("password");
      result.error.issues.forEach((err) => {
        const field = err.path[0] as "email" | "password";
        form.setError(field, {
          type: "manual",
          message: err.message,
        });
      });
      return;
    }

    form.clearErrors("email");
    form.clearErrors("password");

    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Ошибка сервера");
      
      setStep("verification");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerificationSubmit() {
    const code = form.getValues("code");
    if (!code || code.length !== 6) {
      setServerError("Код должен состоять из 6 цифр");
      return;
    }

    setIsLoading(true);
    setServerError(null);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.getValues("email"),
          code: code
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Неверный код");
      
      setStep("profile");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    if (step === "verification") setStep("credentials");
    if (step === "profile") setStep("verification");
    setServerError(null);
  }

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await fetch("/api/auth/register-final", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          code: data.code,
          name: data.name,
          username: data.username,
          
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error("Server Error details:", body);
        throw new Error(body.error || "Ошибка создания аккаунта");
      }

      // Успешная регистрация -> Логинимся через Java Backend
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });
      const loginBody = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginBody.error || "Аккаунт создан, но войти не удалось");

      // Сохраняем данные пользователя
      localStorage.setItem("user", JSON.stringify(loginBody));
      
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'login', token: loginBody.token, user: loginBody })
      });

      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    step,
    isLoading,
    isSuccess,
    serverError,
    handleCredentialsSubmit,
    handleVerificationSubmit,
    handleBack,
    usernameCheck,
    onSubmit: form.handleSubmit(onSubmit),
    isOnline
  };
}
