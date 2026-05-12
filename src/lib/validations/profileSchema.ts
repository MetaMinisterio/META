import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .min(14, "CPF inválido. Use o formato 000.000.000-00")
    .max(14)
    .refine((val) => {
      // Basic validation format xxx.xxx.xxx-xx
      return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(val);
    }, "Formato de CPF inválido"),
  phone: z
    .string()
    .min(15, "Telefone inválido. Use o formato (00) 00000-0000")
    .max(15)
    .refine((val) => {
      return /^\(\d{2}\) \d{5}-\d{4}$/.test(val);
    }, "Formato de telefone inválido"),
  cep: z
    .string()
    .min(9, "CEP inválido. Use o formato 00000-000")
    .max(9)
    .refine((val) => {
      return /^\d{5}-\d{3}$/.test(val);
    }, "Formato de CEP inválido"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
