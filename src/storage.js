// Camada de persistência — usa localStorage como "base de dados" do lado do cliente.
// Quando o Tiago quiser dados reais na nuvem, basta trocar estas funções por
// chamadas a uma API (ex: Supabase, Firebase) mantendo a mesma assinatura.

const KEYS = {
  users: 'btf_users',
  bookings: 'btf_bookings',
  me: 'btf_me',
}

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback)) }
  catch { return fallback }
}

export const storage = {
  getUsers:    () => read(KEYS.users, []),
  saveUsers:   (u) => localStorage.setItem(KEYS.users, JSON.stringify(u)),

  getBookings: () => read(KEYS.bookings, []),
  saveBookings:(b) => localStorage.setItem(KEYS.bookings, JSON.stringify(b)),

  getMe:       () => read(KEYS.me, null),
  saveMe:      (u) => u ? localStorage.setItem(KEYS.me, JSON.stringify(u))
                        : localStorage.removeItem(KEYS.me),
}
