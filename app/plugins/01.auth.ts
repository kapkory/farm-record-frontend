export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Initialize auth state on app start
  if (import.meta.client) {
    await authStore.initialize();
  }
});
