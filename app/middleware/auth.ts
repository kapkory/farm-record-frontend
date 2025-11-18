export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // If not authenticated, redirect to login
  if (!authStore.isLoggedIn) {
    return navigateTo('/login');
  }
});
