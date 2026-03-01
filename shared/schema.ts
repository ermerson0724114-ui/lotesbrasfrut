import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- ENUMS ---
export const ROLES = ["ADMIN", "PRODUCAO", "QUALIDADE", "VISITANTE"] as const;
export const BATCH_STATUS = ["AGUARDANDO", "LIBERADO", "RETIDO"] as const;
export const SAMPLE_RESULT = ["APROVADO", "REPROVADO"] as const;
export const DECIDED_NEXT = ["AGUARDAR_PROXIMA", "LIBERAR", "RETER"] as const;
export const AUDIT_ACTIONS = ["CREATE", "UPDATE", "DELETE", "STATUS_CHANGE", "LOGIN"] as const;

// --- TABLES ---

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role", { enum: ["ADMIN", "PRODUCAO", "QUALIDADE"] }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itemGroups = pgTable("item_groups", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const batches = pgTable("batches", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdByUserId: text("created_by_user_id").notNull(), // FK mapped in app logic
  productionDate: text("production_date").notNull(), // YYYY-MM-DD
  itemCode: text("item_code").notNull(), // 6-7 chars
  itemDescription: text("item_description").notNull(),
  quantityProduced: integer("quantity_produced").notNull(),
  lotCode: text("lot_code").notNull(), // 8-14 chars
  itemGroupId: text("item_group_id").notNull(), // FK mapped in app logic
  status: text("status", { enum: BATCH_STATUS }).default("AGUARDANDO").notNull(),
  currentStage: text("current_stage").default("Aguardando 1ª amostra").notNull(),
  releasedAt: timestamp("released_at"),
  retainedAt: timestamp("retained_at"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
});

export const samples = pgTable("samples", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  batchId: text("batch_id").notNull(),
  sampleNumber: integer("sample_number").notNull(), // 1-4
  result: text("result", { enum: SAMPLE_RESULT }).notNull(),
  reason: text("reason"),
  recommendation: text("recommendation"),
  decidedNext: text("decided_next", { enum: DECIDED_NEXT }).notNull(),
  photoUrl: text("photo_url"),
  createdByUserId: text("created_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id"),
  roleSnapshot: text("role_snapshot"),
  ipAddress: text("ip_address"),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  action: text("action", { enum: AUDIT_ACTIONS }).notNull(),
  diffJson: jsonb("diff_json"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- ZOD SCHEMAS ---

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, passwordHash: true }).extend({
  password: z.string().min(6),
});

export const insertItemGroupSchema = createInsertSchema(itemGroups).omit({ id: true, createdAt: true });

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true, createdAt: true, createdByUserId: true, status: true, currentStage: true, releasedAt: true, retainedAt: true, lastUpdatedAt: true
}).extend({
  itemCode: z.string().min(6).max(7),
  lotCode: z.string().min(8).max(14),
  quantityProduced: z.number().positive(),
});

export const updateBatchSchema = insertBatchSchema.partial();

export const insertSampleSchema = createInsertSchema(samples).omit({
  id: true, createdAt: true, createdByUserId: true, sampleNumber: true, batchId: true
}).extend({
  result: z.enum([SAMPLE_RESULT[0], SAMPLE_RESULT[1]]),
  decidedNext: z.enum([DECIDED_NEXT[0], DECIDED_NEXT[1], DECIDED_NEXT[2]]),
});

// --- TYPES ---
export type User = typeof users.$inferSelect;
export type ItemGroup = typeof itemGroups.$inferSelect;
export type Batch = typeof batches.$inferSelect;
export type Sample = typeof samples.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;

export type LoginRequest = { username: string; password: string };
export type LoginResponse = { token: string; user: Omit<User, "passwordHash"> };

export type CreateUserRequest = z.infer<typeof insertUserSchema>;
export type UpdateUserRequest = Partial<CreateUserRequest>;

export type BatchWithDetails = Batch & {
  groupName: string;
  samples: Sample[];
};

export type DashboardStats = {
  total: number;
  aguardando: number;
  liberados: number;
  retidos: number;
  oldestWaiting: (BatchWithDetails & { daysWaiting: number })[];
};
