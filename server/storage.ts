import { db } from "./db";
import { 
  users, itemGroups, batches, samples, auditLogs,
  type CreateUserRequest, type UpdateUserRequest, type User, type Batch, type Sample, type ItemGroup
} from "@shared/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: CreateUserRequest): Promise<User>;
  updateUser(id: string, user: UpdateUserRequest): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getUsers(): Promise<User[]>;

  // Item Groups
  getItemGroups(): Promise<ItemGroup[]>;
  createItemGroup(group: { name: string }): Promise<ItemGroup>;
  updateItemGroup(id: string, group: { name?: string }): Promise<ItemGroup>;
  deleteItemGroup(id: string): Promise<void>;

  // Batches
  getBatches(): Promise<any[]>;
  getBatch(id: string): Promise<any | undefined>;
  createBatch(batch: any): Promise<Batch>;
  updateBatch(id: string, batch: any): Promise<Batch>;
  deleteBatch(id: string): Promise<void>;

  // Samples
  createSample(sample: any): Promise<Sample>;

  // Logs
  createAuditLog(log: any): Promise<void>;
  getAuditLogs(): Promise<any[]>;
  deleteAllAuditLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: CreateUserRequest): Promise<User> {
    const passwordHash = await bcrypt.hash(user.password, 10);
    const [created] = await db.insert(users).values({
      username: user.username,
      passwordHash,
      displayName: user.displayName,
      role: user.role,
      isActive: user.isActive ?? true,
    }).returning();
    return created;
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const updateData: any = { ...updates };
    if (updates.password) {
      updateData.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updateData.password;
    }
    const [updated] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getItemGroups(): Promise<ItemGroup[]> {
    return await db.select().from(itemGroups).orderBy(desc(itemGroups.createdAt));
  }

  async createItemGroup(group: { name: string }): Promise<ItemGroup> {
    const [created] = await db.insert(itemGroups).values(group).returning();
    return created;
  }

  async updateItemGroup(id: string, group: { name?: string }): Promise<ItemGroup> {
    const [updated] = await db.update(itemGroups).set(group).where(eq(itemGroups.id, id)).returning();
    return updated;
  }

  async deleteItemGroup(id: string): Promise<void> {
    await db.delete(itemGroups).where(eq(itemGroups.id, id));
  }

  async getBatches(): Promise<any[]> {
    // Return all batches along with their group names and samples
    const allBatches = await db.select().from(batches).orderBy(desc(batches.createdAt));
    const allSamples = await db.select().from(samples);
    const allGroups = await db.select().from(itemGroups);

    return allBatches.map(batch => {
      const group = allGroups.find(g => g.id === batch.itemGroupId);
      const batchSamples = allSamples.filter(s => s.batchId === batch.id);
      return {
        ...batch,
        groupName: group?.name || 'Desconhecido',
        samples: batchSamples
      };
    });
  }

  async getBatch(id: string): Promise<any | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    if (!batch) return undefined;
    
    const [group] = await db.select().from(itemGroups).where(eq(itemGroups.id, batch.itemGroupId));
    const batchSamples = await db.select().from(samples).where(eq(samples.batchId, id));

    return {
      ...batch,
      groupName: group?.name || 'Desconhecido',
      samples: batchSamples
    };
  }

  async createBatch(batchData: any): Promise<Batch> {
    const [created] = await db.insert(batches).values(batchData).returning();
    return created;
  }

  async updateBatch(id: string, batchData: any): Promise<Batch> {
    const [updated] = await db.update(batches).set(batchData).where(eq(batches.id, id)).returning();
    return updated;
  }

  async deleteBatch(id: string): Promise<void> {
    await db.delete(batches).where(eq(batches.id, id));
  }

  async createSample(sampleData: any): Promise<Sample> {
    const [created] = await db.insert(samples).values(sampleData).returning();
    return created;
  }

  async createAuditLog(log: any): Promise<void> {
    await db.insert(auditLogs).values(log);
  }

  async getAuditLogs(): Promise<any[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }

  async deleteAllAuditLogs(): Promise<void> {
    await db.delete(auditLogs);
  }
}

export const storage = new DatabaseStorage();
