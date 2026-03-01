import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";
import { fetchWithAuth } from "@/lib/api-client";

type Role = "ADMIN" | "PRODUCAO" | "QUALIDADE" | "VISITANTE";

interface AuthState {
  token: string | null;
  user: any | null; // Detailed user info if we had it
  role: Role;
  isAuthenticated: boolean;
}

function getAuthState(): AuthState {
  const token = localStorage.getItem("token");
  if (!token) {
    return { token: null, user: null, role: "VISITANTE", isAuthenticated: false };
  }
  
  try {
    const decoded: any = jwtDecode(token);
    // Assuming token has role encoded, or we fallback. 
    // Usually backend encodes id, username, role.
    return { 
      token, 
      user: decoded, 
      role: (decoded.role as Role) || "VISITANTE", 
      isAuthenticated: true 
    };
  } catch (err) {
    return { token: null, user: null, role: "VISITANTE", isAuthenticated: false };
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(getAuthState());
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthChange = () => setAuthState(getAuthState());
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Login falhou");
      }
      
      const data = api.auth.login.responses[200].parse(await res.json());
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      setAuthState(getAuthState());
      window.dispatchEvent(new Event("auth-change"));
      queryClient.invalidateQueries();
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    setAuthState(getAuthState());
    window.dispatchEvent(new Event("auth-change"));
    queryClient.invalidateQueries();
  };

  return {
    ...authState,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    logout
  };
}
