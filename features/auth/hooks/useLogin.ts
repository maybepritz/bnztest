
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/entities/user/schema";
import { z } from "zod";

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [step, setStep] = useState<"email" | "password">("email");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Периодическая проверка подключения к бэкенду
  useEffect(() => {
    async function checkConnection() {
      try {
        const res = await fetch("/api/auth/check-username?q=health_check_ping");
        setIsOnline(res.status !== 502 && res.status !== 503 && res.status !== 504); 
        // If server is completely down, Next.js proxy will return 504/502/503 or catch will trigger
      } catch (e) {
        setIsOnline(false);
      }
    }
    
    checkConnection();
    const interval = setInterval(checkConnection, 4000);
    return () => clearInterval(interval);
  }, []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleEmailNext() {
    const emailValue = form.getValues("email");
    const emailSchema = z.string().min(1, "Email обязателен").email("Некорректный email");
    const result = emailSchema.safeParse(emailValue);
    
    if (!result.success) {
      form.setError("email", {
        type: "manual",
        message: result.error.issues[0].message,
      });
      return;
    }
    
    form.clearErrors("email");
    setStep("password");
  }

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch (e) {
        throw new Error(`Parse error. Status: ${response.status}. Body: ${text.slice(0, 100)}`);
      }

      if (!response.ok) {
        setServerError(result.error || "Неверный email или пароль");
      } else {
        // Успешный вход!
        if (typeof window !== "undefined") {
          const userData = {
            id: result.id,
            username: result.username,
            name: result.name,
            image: result.image,
            email: result.email,
            role: result.role
          };
          localStorage.setItem("user", JSON.stringify(userData));
          
          // Сохраняем в куки через безопасный роут (HttpOnly)
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: 'login', token: result.token, user: userData })
          });
        }
        setIsSuccess(true);
      }
    } catch (error: any) {
      setServerError(`Ошибка соединения: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function resetToEmail() {
    setStep("email");
    form.setValue("password", "");
    setServerError(null);
  }

  return { 
    form, 
    step, 
    isLoading, 
    isSuccess,
    serverError, 
    handleEmailNext, 
    onSubmit: form.handleSubmit(onSubmit),
    resetToEmail,
    isOnline
  };
}
