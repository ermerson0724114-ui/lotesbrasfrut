import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev-only";

// Define the shape of our JWT payload
interface JwtPayload {
  userId: string;
  role: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const upload = multer({ dest: 'uploads/' });

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = user as JwtPayload;
    next();
  });
}

function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create uploads dir if it doesn't exist
  if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
  }

  // --- PUBLIC ROUTES ---
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);
      const user = await storage.getUserByUsername(input.username);
      
      if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) {
        return res.status(401).json({ message: "Credenciais inválidas ou usuário inativo." });
      }

      const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      const { passwordHash, ...userWithoutPassword } = user;

      await storage.createAuditLog({
        userId: user.id,
        roleSnapshot: user.role,
        ipAddress: req.ip,
        entityType: 'User',
        entityId: user.id,
        action: 'LOGIN',
      });

      res.json({ token, user: userWithoutPassword });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal error" });
      }
    }
  });

  app.get(api.public.dashboard.path, async (req, res) => {
    const batches = await storage.getBatches();
    const stats = {
      total: batches.length,
      aguardando: batches.filter(b => b.status === "AGUARDANDO").length,
      liberados: batches.filter(b => b.status === "LIBERADO").length,
      retidos: batches.filter(b => b.status === "RETIDO").length,
      oldestWaiting: batches
        .filter(b => b.status === "AGUARDANDO")
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map(b => ({ ...b, daysWaiting: Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24)) }))
        .slice(0, 5)
    };
    res.json(stats);
  });

  app.get(api.public.batches.path, async (req, res) => {
    const batches = await storage.getBatches();
    res.json(batches);
  });

  app.get(api.public.batchDetails.path, async (req, res) => {
    const batch = await storage.getBatch((req.params.id as string));
    if (!batch) return res.status(404).json({ message: "Batch not found" });
    res.json(batch);
  });

  // Export mock logic
  app.get('/api/public/export', async (req, res) => {
    // Mock export logic, normally you'd use csv-stringify and xlsx
    res.send("Export feature pending implementation");
  });

  // --- PRIVATE ROUTES ---
  app.use('/api/batches', authenticateToken);
  app.use('/api/admin', authenticateToken);

  // Batches
  app.post(api.batches.create.path, requireRole(["PRODUCAO", "ADMIN"]), async (req, res) => {
    try {
      const input = api.batches.create.input.parse(req.body);
      const batchData = { ...input, createdByUserId: req.user!.userId };
      const batch = await storage.createBatch(batchData);
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'Batch',
        entityId: batch.id,
        action: 'CREATE',
        diffJson: batch
      });

      res.status(201).json(batch);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal error" });
      }
    }
  });

  app.put(api.batches.update.path, requireRole(["PRODUCAO", "ADMIN"]), async (req, res) => {
    try {
      const input = api.batches.update.input.parse(req.body);
      const batch = await storage.getBatch((req.params.id as string));
      if (!batch) return res.status(404).json({ message: "Batch not found" });

      // Rules: if sample exists, only quantity can be edited unless admin
      if (req.user!.role !== "ADMIN" && batch.samples.length > 0) {
        if (Object.keys(input).some(k => k !== "quantityProduced")) {
          return res.status(400).json({ message: "Cannot edit fields other than quantity after a sample is registered." });
        }
      }

      const updated = await storage.updateBatch((req.params.id as string), input);
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'Batch',
        entityId: updated.id,
        action: 'UPDATE',
        diffJson: { before: batch, after: updated }
      });

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.batches.delete.path, requireRole(["ADMIN"]), async (req, res) => {
    await storage.deleteBatch((req.params.id as string));
    
    await storage.createAuditLog({
      userId: req.user!.userId,
      roleSnapshot: req.user!.role,
      ipAddress: req.ip,
      entityType: 'Batch',
      entityId: (req.params.id as string),
      action: 'DELETE',
    });

    res.status(204).send();
  });

  // Samples
  app.post(api.batches.addSample.path, requireRole(["QUALIDADE", "ADMIN"]), upload.single('photo'), async (req, res) => {
    try {
      const batchId = (req.params.id as string);
      const batch = await storage.getBatch(batchId);
      if (!batch) return res.status(404).json({ message: "Batch not found" });

      const sampleNumber = batch.samples.length + 1;
      if (sampleNumber > 4) return res.status(400).json({ message: "Maximum samples reached (4)." });

      const { result, reason, recommendation, decidedNext } = req.body;
      let photoUrl = null;
      if (req.file) {
        photoUrl = `/uploads/${req.file.filename}`;
      }

      const sampleData = {
        batchId,
        sampleNumber,
        result,
        reason: reason || null,
        recommendation: recommendation || null,
        decidedNext,
        photoUrl,
        createdByUserId: req.user!.userId,
      };

      const sample = await storage.createSample(sampleData);

      // Workflow update on Batch
      let newStatus = batch.status;
      let newStage = batch.currentStage;
      
      if (decidedNext === "LIBERAR") {
        newStatus = "LIBERADO";
        newStage = "Liberado";
      } else if (decidedNext === "RETER") {
        newStatus = "RETIDO";
        newStage = "Retido";
      } else {
        newStage = `Aguardando ${sampleNumber + 1}ª amostra`;
      }

      const updatedBatch = await storage.updateBatch(batchId, { 
        status: newStatus, 
        currentStage: newStage,
        releasedAt: newStatus === "LIBERADO" ? new Date().toISOString() : batch.releasedAt,
        retainedAt: newStatus === "RETIDO" ? new Date().toISOString() : batch.retainedAt,
        lastUpdatedAt: new Date().toISOString()
      });

      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'Sample',
        entityId: sample.id,
        action: 'CREATE',
        diffJson: sample
      });

      res.status(201).json(sample);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal error" });
    }
  });

  // Admin - Users
  app.get(api.admin.users.list.path, requireRole(["ADMIN"]), async (req, res) => {
    const users = await storage.getUsers();
    res.json(users.map(({ passwordHash, ...u }) => u));
  });

  app.post(api.admin.users.create.path, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const input = api.admin.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      const { passwordHash, ...userWithoutPassword } = user;
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'User',
        entityId: user.id,
        action: 'CREATE',
      });

      res.status(201).json(userWithoutPassword);
    } catch(err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal error" });
    }
  });

  app.put(api.admin.users.update.path, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const input = api.admin.users.update.input.parse(req.body);
      const user = await storage.updateUser((req.params.id as string), input);
      const { passwordHash, ...userWithoutPassword } = user;
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'User',
        entityId: user.id,
        action: 'UPDATE',
      });

      res.json(userWithoutPassword);
    } catch(err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.admin.users.delete.path, requireRole(["ADMIN"]), async (req, res) => {
    await storage.deleteUser((req.params.id as string));
    
    await storage.createAuditLog({
      userId: req.user!.userId,
      roleSnapshot: req.user!.role,
      ipAddress: req.ip,
      entityType: 'User',
      entityId: (req.params.id as string),
      action: 'DELETE',
    });

    res.status(204).send();
  });

  // Admin - Groups
  app.get(api.admin.groups.list.path, requireRole(["ADMIN"]), async (req, res) => {
    res.json(await storage.getItemGroups());
  });

  app.post(api.admin.groups.create.path, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const input = api.admin.groups.create.input.parse(req.body);
      const group = await storage.createItemGroup(input);
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'ItemGroup',
        entityId: group.id,
        action: 'CREATE',
      });

      res.status(201).json(group);
    } catch(err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal error" });
    }
  });

  app.put(api.admin.groups.update.path, requireRole(["ADMIN"]), async (req, res) => {
    try {
      const input = api.admin.groups.update.input.parse(req.body);
      const group = await storage.updateItemGroup((req.params.id as string), input);
      
      await storage.createAuditLog({
        userId: req.user!.userId,
        roleSnapshot: req.user!.role,
        ipAddress: req.ip,
        entityType: 'ItemGroup',
        entityId: group.id,
        action: 'UPDATE',
      });

      res.json(group);
    } catch(err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.errors[0].message });
      else res.status(500).json({ message: "Internal error" });
    }
  });

  app.delete(api.admin.groups.delete.path, requireRole(["ADMIN"]), async (req, res) => {
    await storage.deleteItemGroup((req.params.id as string));
    
    await storage.createAuditLog({
      userId: req.user!.userId,
      roleSnapshot: req.user!.role,
      ipAddress: req.ip,
      entityType: 'ItemGroup',
      entityId: (req.params.id as string),
      action: 'DELETE',
    });

    res.status(204).send();
  });

  // Admin - Logs
  app.get(api.admin.logs.list.path, requireRole(["ADMIN"]), async (req, res) => {
    const logs = await storage.getAuditLogs();
    res.json(logs);
  });

  app.delete(api.admin.logs.deleteAll.path, requireRole(["ADMIN"]), async (req, res) => {
    await storage.deleteAllAuditLogs();
    res.status(204).send();
  });

  return httpServer;
}
