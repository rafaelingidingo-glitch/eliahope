/**
 * Admin API helper utilities
 * 
 * Provides authenticated fetch functions that automatically include
 * the admin Bearer token from localStorage.
 * 
 * On 401 (unauthorized), automatically clears the token and redirects
 * to the login page since the session is no longer valid.
 */

const TOKEN_KEY = 'admin_token'

/** Get the stored admin token */
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Get headers with Authorization Bearer token */
export function getAdminHeaders(): Record<string, string> {
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

/** Force logout — clear token and redirect to login */
function forceLogout() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore storage errors
  }
  // Only redirect if in browser context
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login'
  }
}

/** Authenticated fetch wrapper for admin API calls */
export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAdminHeaders()

  // Merge with any existing headers
  const mergedHeaders = {
    ...headers,
    ...(options.headers as Record<string, string> || {}),
  }

  // For FormData uploads, remove Content-Type so browser sets it with boundary
  if (options.body instanceof FormData) {
    delete mergedHeaders['Content-Type']
  }

  const response = await fetch(url, {
    ...options,
    headers: mergedHeaders,
  })

  // On 401, the token is no longer valid — force logout and redirect
  if (response.status === 401) {
    forceLogout()
  }

  return response
}
