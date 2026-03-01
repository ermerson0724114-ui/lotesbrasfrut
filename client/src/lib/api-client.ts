import { api, buildUrl } from "@shared/routes";

// Custom fetch wrapper to handle JWT Bearer token
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set content-type if not already set (FormData needs browser to set it with boundary)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // If 401, clear token
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth-change"));
    }
    
    // Try to parse error message
    let errorMessage = "Ocorreu um erro inesperado";
    try {
      const data = await response.json();
      if (data.message) errorMessage = data.message;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
