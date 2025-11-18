export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // If already authenticated, redirect to dashboard
  if (authStore.isLoggedIn) {
    return navigateTo('/admin');
  }
});
