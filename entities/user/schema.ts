import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z.string().min(1, "Пароль обязателен").min(6, "Минимум 6 символов"),
});

export const credentialsSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const verifySchema = z.object({
  code: z.string().length(6, "Код должен состоять из 6 цифр"),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Имя слишком короткое"),
  username: z.string().min(3, "От 3 символов").max(20, "До 20 символов").regex(/^[a-zA-Z0-9_]+$/, "Буквы, цифры, подчеркивания"),
  
});

export const registerSchema = credentialsSchema.merge(verifySchema).merge(profileSchema);

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
