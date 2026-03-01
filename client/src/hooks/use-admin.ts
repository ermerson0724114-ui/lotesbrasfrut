import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { z } from "zod";

// --- USERS ---
export function useUsers() {
  return useQuery({
    queryKey: [api.admin.users.list.path],
    queryFn: () => fetchWithAuth(api.admin.users.list.path),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.admin.users.create.input>) => 
      fetchWithAuth(api.admin.users.create.path, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] }),
  });
}

// --- GROUPS ---
export function useGroups() {
  return useQuery({
    queryKey: [api.admin.groups.list.path],
    // Let it fail silently if not logged in (since producing users need to fetch this too)
    queryFn: () => fetchWithAuth(api.admin.groups.list.path).catch(() => []), 
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: z.infer<typeof api.admin.groups.create.input>) => 
      fetchWithAuth(api.admin.groups.create.path, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.groups.list.path] }),
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => 
      fetchWithAuth(buildUrl(api.admin.groups.delete.path, { id }), { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.groups.list.path] }),
  });
}

// --- LOGS ---
export function useLogs() {
  return useQuery({
    queryKey: [api.admin.logs.list.path],
    queryFn: () => fetchWithAuth(api.admin.logs.list.path),
  });
}

export function useClearLogs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fetchWithAuth(api.admin.logs.deleteAll.path, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.admin.logs.list.path] }),
  });
}
