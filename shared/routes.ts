import { z } from 'zod';
import { 
  insertUserSchema, 
  insertItemGroupSchema, 
  insertBatchSchema, 
  updateBatchSchema, 
  insertSampleSchema,
  users,
  itemGroups,
  batches,
  samples,
  auditLogs
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({
          token: z.string(),
          user: z.custom<Omit<typeof users.$inferSelect, "passwordHash">>(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  public: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/public/dashboard' as const,
      responses: {
        200: z.any(), // Returning DashboardStats
      },
    },
    batches: {
      method: 'GET' as const,
      path: '/api/public/batches' as const,
      responses: {
        200: z.array(z.any()), // Array of BatchWithDetails
      },
    },
    batchDetails: {
      method: 'GET' as const,
      path: '/api/public/batches/:id' as const,
      responses: {
        200: z.any(), // BatchWithDetails
        404: errorSchemas.notFound,
      },
    },
  },
  batches: {
    create: {
      method: 'POST' as const,
      path: '/api/batches' as const,
      input: insertBatchSchema,
      responses: {
        201: z.custom<typeof batches.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/batches/:id' as const,
      input: updateBatchSchema,
      responses: {
        200: z.custom<typeof batches.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/batches/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    addSample: {
      method: 'POST' as const,
      path: '/api/batches/:id/samples' as const,
      input: z.any(), // FormData for file upload, manually handled in backend
      responses: {
        201: z.custom<typeof samples.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: { 200: z.array(z.custom<Omit<typeof users.$inferSelect, "passwordHash">>()) },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/users' as const,
        input: insertUserSchema,
        responses: { 201: z.custom<Omit<typeof users.$inferSelect, "passwordHash">>() },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/users/:id' as const,
        input: insertUserSchema.partial(),
        responses: { 200: z.custom<Omit<typeof users.$inferSelect, "passwordHash">>() },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:id' as const,
        responses: { 204: z.void() },
      },
    },
    groups: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/groups' as const,
        responses: { 200: z.array(z.custom<typeof itemGroups.$inferSelect>()) },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/groups' as const,
        input: insertItemGroupSchema,
        responses: { 201: z.custom<typeof itemGroups.$inferSelect>() },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/groups/:id' as const,
        input: insertItemGroupSchema.partial(),
        responses: { 200: z.custom<typeof itemGroups.$inferSelect>() },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/groups/:id' as const,
        responses: { 204: z.void() },
      },
    },
    logs: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/logs' as const,
        responses: { 200: z.any() }, // Paginated list
      },
      deleteAll: {
        method: 'DELETE' as const,
        path: '/api/admin/logs' as const,
        responses: { 204: z.void() },
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
