import axios from 'axios'
import { useSanctum } from '~/composables/useSanctum'

export const useAuth = () => {
  const { ensureCsrf } = useSanctum()
  const config = useRuntimeConfig()
  const rawBase = (config.public.apiBase || '').replace(/\/+$/, '')
  const base = /^http:\/\/(?!localhost|127\.0\.0\.1)/i.test(rawBase) ? rawBase.replace(/^http:\/\//i, 'https://') : rawBase

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
    await ensureCsrf()
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

  async function resetPassword(payload: Record<string, any>) {
    await ensureCsrf()
    const token = getCookie('XSRF-TOKEN') || getCookie('X-CSRF-TOKEN') || ''
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) {
      headers['X-XSRF-TOKEN'] = token
      headers['X-CSRF-TOKEN'] = token
    }
    return axios.post(`${base}/reset-password`, payload, {
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

  return { register, login, forgotPassword, resetPassword, logout }
}
