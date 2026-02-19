const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export interface RequestOptions {
  headers?: Record<string, string>
  body?: unknown
}

async function apiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options?.headers,
  }

  // Add token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export const apiClient = {
  get: <T,>(endpoint: string, options?: RequestOptions) => apiCall<T>(endpoint, "GET", options),
  post: <T,>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiCall<T>(endpoint, "POST", { ...options, body }),
  put: <T,>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiCall<T>(endpoint, "PUT", { ...options, body }),
  delete: <T,>(endpoint: string, options?: RequestOptions) => apiCall<T>(endpoint, "DELETE", options),
}
