/**
 * Schemas Zod para validação de formulários — mensagens em português.
 * Constraints derivadas dos schemas gerados pelo Kubb (mesma fonte: spec OpenAPI).
 */
import { z } from 'zod/v4'

export const loginFormSchema = z.object({
  email:    z.email('Email inválido.'),
  password: z.string().min(1, 'A palavra-passe é obrigatória.'),
})

// Mirrors: registerRequestSchema (customers spec)
export const registerFormSchema = z.object({
  name:     z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email:    z.email('Email inválido.'),
  phone:    z.string().min(9, 'Telemóvel deve ter pelo menos 9 dígitos.').or(z.literal('')).optional(),
  password: z.string().min(6, 'A palavra-passe deve ter mínimo 6 caracteres.'),
})

// Mirrors: postWebsitesCustomersAutenticationForgotPasswordMutationRequestSchema
export const forgotFormSchema = z.object({
  email: z.email('Email inválido.'),
})

// Mirrors: postWebsitesCustomersAutenticationResetPasswordMutationRequestSchema
export const resetFormSchema = z.object({
  newPassword:     z.string().min(8, 'A palavra-passe deve ter mínimo 8 caracteres.'),
  confirmPassword: z.string().min(1, 'Confirma a nova palavra-passe.'),
}).refine(
  d => d.newPassword === d.confirmPassword,
  { message: 'As palavras-passe não coincidem.', path: ['confirmPassword'] },
)

// Mirrors: updateProfileRequestSchema (customers spec)
export const profileFormSchema = z.object({
  name:  z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.email('Email inválido.'),
  phone: z.string().min(9, 'Telemóvel deve ter pelo menos 9 dígitos.'),
  nif:   z.union([z.literal(''), z.string().regex(/^\d{9}$/, 'NIF deve ter exactamente 9 dígitos.')]).optional(),
})

/** Devolve a mensagem do primeiro erro do safeParse */
export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Dados inválidos.'
}
