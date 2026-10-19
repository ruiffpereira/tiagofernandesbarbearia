// Códigos da API que têm texto próprio (chave do CMS + fallback PT)
const CODE_MSGS = {
  CURRENT_PASSWORD_REQUIRED: ['auth.erro.passwordActualObrigatoria', 'Indica a tua password actual para mudar o email.'],
  CURRENT_PASSWORD_INVALID: ['auth.erro.passwordActualInvalida', 'A password actual está errada.'],
  EMAIL_CHANGE_GOOGLE_ACCOUNT: ['auth.erro.emailContaGoogle', 'O email é o da tua conta Google e não pode ser alterado aqui.'],
  TOO_MANY_APPOINTMENTS: ['booking.erro.maxFuturas', 'Já tens o número máximo de marcações futuras. Cancela uma para marcar outra.'],
}

/**
 * Mensagem de erro para mostrar ao utilizador a partir de um erro de pedido.
 * Nunca usa `e.message` (texto técnico em inglês do axios): usa a mensagem que a
 * API devolve, ou o texto genérico do CMS (com fallback PT).
 */
export function errMsg(e, t) {
  const known = CODE_MSGS[e?.response?.data?.code]
  if (known) return t(known[0]) || known[1]
  return e?.response?.data?.message || t('auth.erro.generico') || 'Ocorreu um erro. Tenta novamente.'
}
