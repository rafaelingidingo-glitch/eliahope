/**
 * Admin API helper utilities
 * 
 * Provides authenticated fetch functions that automatically include
 * the admin Bearer token from localStorage.
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

  // Only clear token on 401 (unauthorized), NOT on 403 (forbidden).
  // A 403 might mean the user lacks permission for a specific action,
  // not that their entire session is invalid.
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY)
  }

  return response
}
