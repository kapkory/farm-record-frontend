/**
 * Keeps staff logins out of money pages (sales, costs, reports).
 *
 * This is a courtesy redirect so they never land on a page that would just
 * 403 — the API is the real boundary and blocks these reads regardless.
 */
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initialize()
  }

  if (authStore.isLoggedIn && !authStore.canViewFinances) {
    return navigateTo('/admin')
  }
})
