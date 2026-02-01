import { Router } from "express";
import bcrypt from "bcryptjs";
import { requireAdmin } from "../auth.js";
import { User } from "../models/User.js";
import { Webhook } from "../models/Webhook.js";

export const adminRouter = Router();

adminRouter.get("/users", requireAdmin, async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ users });
});

adminRouter.post("/users", requireAdmin, async (req, res) => {
  const { username, password, role, quotaBytes } = req.body as {
    username?: string;
    password?: string;
    role?: "admin" | "user";
    quotaBytes?: number;
  };
  if (!username || !password) {
    return res.status(400).json({ error: "missing_fields" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    passwordHash: hash,
    role: role || "user",
    quotaBytes: quotaBytes ?? 0,
    usedBytes: 0
  });
  res.json({ id: user.id });
});

adminRouter.patch("/users/:id", requireAdmin, async (req, res) => {
  const { quotaBytes, role, password } = req.body as { quotaBytes?: number; role?: "admin" | "user"; password?: string };
  const update: Record<string, unknown> = {};
  if (typeof quotaBytes === "number") update.quotaBytes = quotaBytes;
  if (role) update.role = role;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);
  await User.findByIdAndUpdate(req.params.id, update);
  res.json({ ok: true });
});

adminRouter.get("/webhooks", requireAdmin, async (_req, res) => {
  const webhooks = await Webhook.find().sort({ createdAt: -1 }).lean();
  res.json({ webhooks });
});

adminRouter.post("/webhooks", requireAdmin, async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url) {
    return res.status(400).json({ error: "missing_url" });
  }
  const hook = await Webhook.create({ url, enabled: true });
  res.json({ id: hook.id });
});

adminRouter.patch("/webhooks/:id", requireAdmin, async (req, res) => {
  const { enabled } = req.body as { enabled?: boolean };
  if (typeof enabled !== "boolean") {
    return res.status(400).json({ error: "missing_enabled" });
  }
  await Webhook.findByIdAndUpdate(req.params.id, { enabled });
  res.json({ ok: true });
});
