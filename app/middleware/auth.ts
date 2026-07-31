const CHANGE_PASSWORD_PATH = '/admin/change-password';

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();

  // Skip on server to avoid SSR redirect before client restore
  if (!import.meta.client) {
    return;
  }

  const enforcePasswordChange = () => {
    if (authStore.farmer?.must_change_password && to.path !== CHANGE_PASSWORD_PATH) {
      return navigateTo(CHANGE_PASSWORD_PATH);
    }
  };

  // If we have not initialized yet, try to restore session before redirecting
  if (!authStore.isInitialized && import.meta.client) {
    return authStore.initialize().then(() => {
      if (!authStore.isLoggedIn) {
        console.log('User not authenticated after initialization, redirecting to login.');
        return navigateTo('/login');
      }
      return enforcePasswordChange();
    });
  }

  // If not authenticated, redirect to login
  if (!authStore.isLoggedIn) {
    console.log('User not authenticated, redirecting to login.');
    return navigateTo('/login');
  }

  return enforcePasswordChange();
});
