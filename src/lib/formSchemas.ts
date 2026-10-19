/**
 * Schemas Zod para validação de formulários.
 * Constraints derivadas dos schemas gerados pelo Kubb (mesma fonte: spec OpenAPI).
 *
 * As mensagens NÃO são texto: são chaves do CMS (`validacao.*`). Os schemas são de
 * módulo (sem acesso a hooks), por isso a tradução acontece onde o erro é mostrado,
 * em `firstZodError(error, t)` — CMS na língua atual, com fallback PT.
 */
import { z } from 'zod/v4'

/** Chaves do CMS usadas como mensagem de erro dos schemas. */
export const V = {
  email:         'validacao.email',
  passObrig:     'validacao.password_obrigatoria',
  nomeMin:       'validacao.nome_min',
  telefoneMin:   'validacao.telemovel_min',
  passMin6:      'validacao.password_min6',
  passMin8:      'validacao.password_min8',
  confirmar:     'validacao.confirmar_password',
  passDiferentes:'validacao.passwords_diferentes',
  nif:           'validacao.nif',
  invalido:      'validacao.invalido',
} as const

/** Fallback PT — usado quando o CMS ainda não tem a chave. */
const FALLBACK_PT: Record<string, string> = {
  [V.email]:          'Email inválido.',
  [V.passObrig]:      'A palavra-passe é obrigatória.',
  [V.nomeMin]:        'O nome deve ter pelo menos 2 caracteres.',
  [V.telefoneMin]:    'Telemóvel deve ter pelo menos 9 dígitos.',
  [V.passMin6]:       'A palavra-passe deve ter mínimo 6 caracteres.',
  [V.passMin8]:       'A palavra-passe deve ter mínimo 8 caracteres.',
  [V.confirmar]:      'Confirma a nova palavra-passe.',
  [V.passDiferentes]: 'As palavras-passe não coincidem.',
  [V.nif]:            'NIF deve ter exactamente 9 dígitos.',
  [V.invalido]:       'Dados inválidos.',
}

export const loginFormSchema = z.object({
  email:    z.email(V.email),
  password: z.string().min(1, V.passObrig),
})

// Mirrors: registerRequestSchema (customers spec)
export const registerFormSchema = z.object({
  name:     z.string().min(2, V.nomeMin),
  email:    z.email(V.email),
  phone:    z.string().min(9, V.telefoneMin).or(z.literal('')).optional(),
  password: z.string().min(6, V.passMin6),
})

// Mirrors: postWebsitesCustomersAutenticationForgotPasswordMutationRequestSchema
export const forgotFormSchema = z.object({
  email: z.email(V.email),
})

// Mirrors: postWebsitesCustomersAutenticationResetPasswordMutationRequestSchema
export const resetFormSchema = z.object({
  newPassword:     z.string().min(8, V.passMin8),
  confirmPassword: z.string().min(1, V.confirmar),
}).refine(
  d => d.newPassword === d.confirmPassword,
  { message: V.passDiferentes, path: ['confirmPassword'] },
)

// Mirrors: updateProfileRequestSchema (customers spec)
export const profileFormSchema = z.object({
  name:  z.string().min(2, V.nomeMin),
  email: z.email(V.email),
  phone: z.string().min(9, V.telefoneMin),
  nif:   z.union([z.literal(''), z.string().regex(/^\d{9}$/, V.nif)]).optional(),
})

/**
 * Devolve a mensagem (traduzida) do primeiro erro do safeParse.
 * `t` é o `t()` do CmsContext (devolve '' se a chave faltar).
 */
export function firstZodError(error: z.ZodError, t?: (key: string) => string): string {
  const key = error.issues[0]?.message ?? V.invalido
  return t?.(key) || FALLBACK_PT[key] || FALLBACK_PT[V.invalido]
}
