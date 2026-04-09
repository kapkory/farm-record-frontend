import { ref } from 'vue'

export const useSanctum = () => {
  const isReady = ref(false)
  const isLoading = ref(false)
  const config = useRuntimeConfig()
  const rawBase = (config.public.apiBase || '').replace(/\/+$/, '')
  const base = /^http:\/\/(?!localhost|127\.0\.0\.1)/i.test(rawBase) ? rawBase.replace(/^http:\/\//i, 'https://') : rawBase

  // Ensure the CSRF cookie is set by calling /sanctum/csrf-cookie once
  async function ensureCsrf() {
    if (isReady.value || isLoading.value) return
    isLoading.value = true
    try {
      await $fetch(`${base}/sanctum/csrf-cookie`, {
        credentials: 'include',
        method: 'GET'
      })
      isReady.value = true
    } finally {
      isLoading.value = false
    }
  }

  return { ensureCsrf, isReady, isLoading }
}
