import axios from 'axios'
import { useSanctum } from '~/composables/useSanctum'

export const useAuth = () => {
  const { ensureCsrf } = useSanctum()
  const config = useRuntimeConfig()
  const base = (config.public.apiBase || '').replace(/\/+$/, '')

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return ''
    const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
    return match ? decodeURIComponent((match.split('=')[1]) ?? '') : ''
  }

  async function register(payload: Record<string, any>) {
    // Ensure CSRF cookie (Sanctum)
    await ensureCsrf()

    // read token from cookie (Laravel sets XSRF-TOKEN)
    const token = getCookie('XSRF-TOKEN') || getCookie('X-CSRF-TOKEN') || ''
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      // include both headers to satisfy varying expectations
      headers['X-XSRF-TOKEN'] = token
      headers['X-CSRF-TOKEN'] = token
    }

    return axios.post(`${base}/register`, payload, {
      withCredentials: true,
      headers
    })
  }
  
  async function login(payload: Record<string, any>) {
    await ensureCsrf()
    const token = getCookie('XSRF-TOKEN') || getCookie('X-CSRF-TOKEN') || ''
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      headers['X-XSRF-TOKEN'] = token
      headers['X-CSRF-TOKEN'] = token
    }
    return axios.post(`${base}/login`, payload, {
      withCredentials: true,
      headers
    })
  }
  
  async function forgotPassword(payload: Record<string, any>) {
    // Laravel often exposes POST /forgot-password for password resets
    const token = getCookie('XSRF-TOKEN') || getCookie('X-CSRF-TOKEN') || ''
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      headers['X-XSRF-TOKEN'] = token
      headers['X-CSRF-TOKEN'] = token
    }
    return axios.post(`${base}/forgot-password`, payload, {
      withCredentials: true,
      headers
    })
  }

  async function logout() {
    await ensureCsrf()
    const token = getCookie('XSRF-TOKEN') || getCookie('X-CSRF-TOKEN') || ''
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      headers['X-XSRF-TOKEN'] = token
      headers['X-CSRF-TOKEN'] = token
    }
    return axios.post(`${base}/logout`, {}, { withCredentials: true, headers })
  }

  return { register, login, forgotPassword, logout }
}
