import type { Farmer } from "~/types/auth";

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterCredentials {
  name: string;
  email: string;
  phone: string;
  farm_name: string;
  farm_type: string;
  password: string;
}

interface ValidationErrors {
  name?: string[];
  email?: string[];
  phone?: string[];
  farm_name?: string[];
  farm_type?: string[];
  password?: string[];
  [key: string]: string[] | undefined;
}

export const useAuthStore = defineStore('authStore', () => {
  const nuxtApp = useNuxtApp();
  const apiFetch = nuxtApp.$apiFetch;
  const router = useRouter();

  // State
  const farmer = ref<Farmer | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // Computed
  const currentFarmer = computed(() => farmer.value);
  const isLoggedIn = computed(() => isAuthenticated.value);
  const authError = computed(() => error.value);
  const authLoading = computed(() => isLoading.value);

  // Actions
  const login = async (credentials: LoginCredentials) => {
    // Prevent duplicate submissions
    if (isLoading.value) {
      console.log('Login already in progress, skipping duplicate request');
      return { success: false, error: 'Request already in progress' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Ensure CSRF cookie is set
      await apiFetch('/sanctum/csrf-cookie');
      
      // Small delay to ensure cookie is set in browser
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('CSRF cookie ensured.');
      if (import.meta.client) {
        console.log('cookie value is:', document.cookie);
      }
      
    
      // Login request
      await apiFetch('/login', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
          remember: credentials.remember || false,
        },
      });
      console.log('Login successful.');
      // Fetch user data after successful login
      await fetchUser();
      console.log('User data fetched:', farmer.value);

      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_logged_in', 'true');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      
      const resData = err?.response?.data || err?.data;
      
      // Handle validation errors
      if (resData?.errors) {
        const validationErrors = resData.errors as ValidationErrors;
        const errorMessages: string[] = [];
        
        Object.keys(validationErrors).forEach((key) => {
          const msgs = validationErrors[key];
          if (msgs && msgs.length > 0) {
            errorMessages.push(...msgs);
          }
        });
        
        error.value = errorMessages.join(', ');
        return { success: false, errors: validationErrors };
      }
      
      error.value = resData?.message || 'Invalid email or password';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUser = async () => {
    try {
      const userData = await apiFetch<Farmer>('/api/user', {
        method: 'GET',
      });

      farmer.value = userData;
      isAuthenticated.value = true;
    } catch (err: any) {
      console.error('Fetch user error:', err);
      farmer.value = null;
      isAuthenticated.value = false;
      throw err;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      await apiFetch('/logout', {
        method: 'POST',
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear state
      farmer.value = null;
      isAuthenticated.value = false;
      error.value = null;
      isLoading.value = false;

      // Clear localStorage
      if (import.meta.client) {
        localStorage.removeItem('auth_logged_in');
      }

      // Redirect to login
      await router.push('/login');
    }
  };

  const initialize = async () => {
    if (isInitialized.value) return;

    // Check if user was logged in (from localStorage)
    if (import.meta.client) {
      const wasLoggedIn = localStorage.getItem('auth_logged_in');
      
      if (wasLoggedIn === 'true') {
        try {
          // Ensure CSRF cookie before hitting /api/user
          await apiFetch('/sanctum/csrf-cookie');
          await fetchUser();
        } catch (err: any) {
          const status = err?.response?.status || err?.status;
          if (status === 401 || status === 419) {
            localStorage.removeItem('auth_logged_in');
            farmer.value = null;
            isAuthenticated.value = false;
          }
        }
      }
    }

    isInitialized.value = true;
  };

  const register = async (credentials: RegisterCredentials) => {
    // Prevent duplicate submissions
    if (isLoading.value) {
      console.log('Registration already in progress, skipping duplicate request');
      return { success: false, error: 'Request already in progress' };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Ensure CSRF cookie is set
      await apiFetch('/sanctum/csrf-cookie');
      
      // Small delay to ensure cookie is set in browser
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('CSRF cookie ensured.');
      if (import.meta.client) {
        console.log('cookie value is:', document.cookie);
      }
      
      // Register request
      await apiFetch('/register', {
        method: 'POST',
        body: {
          name: credentials.name,
          email: credentials.email,
          phone: credentials.phone,
          farm_name: credentials.farm_name,
          farm_type: credentials.farm_type,
          password: credentials.password,
        },
      });

      // Fetch user data after successful registration
      await fetchUser();

      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem('auth_logged_in', 'true');
      }

      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      
      const resData = err?.response?.data || err?.data;
      
      // Handle validation errors
      if (resData?.errors) {
        const validationErrors = resData.errors as ValidationErrors;
        const errorMessages: string[] = [];
        
        Object.keys(validationErrors).forEach((key) => {
          const msgs = validationErrors[key];
          if (msgs && msgs.length > 0) {
            errorMessages.push(...msgs);
          }
        });
        
        error.value = errorMessages.join(', ');
        return { success: false, errors: validationErrors };
      }
      
      error.value = resData?.message || 'Registration failed. Please try again.';
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    farmer,
    isAuthenticated,
    isLoading,
    error,
    // Computed
    currentFarmer,
    isLoggedIn,
    authError,
    authLoading,
    isInitialized,
    // Actions
    login,
    register,
    logout,
    fetchUser,
    initialize,
    clearError,
  };
});