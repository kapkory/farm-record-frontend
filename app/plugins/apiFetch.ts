export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase.replace(/\/+$/, ''),
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'X-XSRF-TOKEN': useCookie('XSRF-TOKEN').value || '',
    },
  });

  nuxtApp.provide('apiFetch', apiFetch as typeof $fetch);
});
