const TOKEN_KEY = 'btf_access_token'
export const USER_KEY = 'btf_user'

export const tokenStore = {
  getAccess: () => localStorage.getItem(TOKEN_KEY),
  saveAccess: (access) => {
    if (access) localStorage.setItem(TOKEN_KEY, access)
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
