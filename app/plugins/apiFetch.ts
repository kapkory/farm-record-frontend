export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();
    nuxtApp.provide('apiFetch',$fetch.create({
        baseURL: config.public.apiBase.replace(/\/+$/,''),
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value || '',
        }
    }))
})
