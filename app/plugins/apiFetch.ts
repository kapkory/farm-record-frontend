export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  const apiFetch = $fetch.create({
    baseURL: config.public.apiBase.replace(/\/+$/, ''),
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
    onRequest({ options }) {
      // Read CSRF token dynamically from document.cookie on each request
      if (import.meta.client) {
        // Read directly from document.cookie to get the latest value
        const match = document.cookie.match(/(^|;)\s*XSRF-TOKEN=([^;]+)/);
        const token = match && match[2] ? decodeURIComponent(match[2]) : null;
        console.log('CSRF Token:', token);
        if (token) {
          // Cast to any to bypass TypeScript strict checks for header assignment
          (options.headers as any) = {
            ...(options.headers as any || {}),
            'X-XSRF-TOKEN': token
            };
        }
      }
    },
  });

  nuxtApp.provide('apiFetch', apiFetch as typeof $fetch);
});
