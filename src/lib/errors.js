/**
 * Mensagem de erro para mostrar ao utilizador a partir de um erro de pedido.
 * Nunca usa `e.message` (texto técnico em inglês do axios): usa a mensagem que a
 * API devolve, ou o texto genérico do CMS (com fallback PT).
 */
export function errMsg(e, t) {
  return e?.response?.data?.message || t('auth.erro.generico') || 'Ocorreu um erro. Tenta novamente.'
}
