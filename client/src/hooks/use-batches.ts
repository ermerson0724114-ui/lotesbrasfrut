import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { z } from "zod";

export function useDashboard(params?: { groupId?: string; month?: string }) {
  const queryStr = new URLSearchParams(params as Record<string, string>).toString();
  const url = `${api.public.dashboard.path}${queryStr ? `?${queryStr}` : ''}`;
  
  return useQuery({
    queryKey: [api.public.dashboard.path, params],
    queryFn: () => fetchWithAuth(url),
  });
}

export function useBatches(params?: { status?: string; groupId?: string; month?: string; search?: string }) {
  // Clean up undefined params
  const cleanParams = Object.fromEntries(
    Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== '')
  ) as Record<string, string>;
  
  const queryStr = new URLSearchParams(cleanParams).toString();
  const url = `${api.public.batches.path}${queryStr ? `?${queryStr}` : ''}`;

  return useQuery({
    queryKey: [api.public.batches.path, cleanParams],
    queryFn: () => fetchWithAuth(url),
  });
}

export function useBatchDetails(id: string) {
  const url = buildUrl(api.public.batchDetails.path, { id });
  return useQuery({
    queryKey: [api.public.batchDetails.path, id],
    queryFn: () => fetchWithAuth(url),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.batches.create.input>) => {
      return fetchWithAuth(api.batches.create.path, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.public.batches.path] });
      queryClient.invalidateQueries({ queryKey: [api.public.dashboard.path] });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof api.batches.update.input> }) => {
      const url = buildUrl(api.batches.update.path, { id });
      return fetchWithAuth(url, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.public.batches.path] });
      queryClient.invalidateQueries({ queryKey: [api.public.batchDetails.path, variables.id] });
    },
  });
}

export function useAddSample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ batchId, formData }: { batchId: string; formData: FormData }) => {
      const url = buildUrl(api.batches.addSample.path, { id: batchId });
      // FormData is passed directly, content-type is NOT set so browser handles boundary
      return fetchWithAuth(url, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.public.batches.path] });
      queryClient.invalidateQueries({ queryKey: [api.public.batchDetails.path, variables.batchId] });
      queryClient.invalidateQueries({ queryKey: [api.public.dashboard.path] });
    },
  });
}
