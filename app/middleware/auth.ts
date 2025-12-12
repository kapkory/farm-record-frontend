export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // If we have not initialized yet, try to restore session before redirecting
  if (!authStore.isInitialized && import.meta.client) {
    return authStore.initialize().then(() => {
      if (!authStore.isLoggedIn) {
        return navigateTo('/login');
      }
    });
  }

  // If not authenticated, redirect to login
  if (!authStore.isLoggedIn) {
    return navigateTo('/login');
  }
});
