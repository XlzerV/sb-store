import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../index";
import { signToken, getJwtSecret } from "../middleware/auth";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const emailValue = email.trim();
    const user = await prisma.user.findFirst({
      where: { email: { equals: emailValue, mode: "insensitive" } },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const secure = process.env.NODE_ENV === "production";
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.json({ user: null });
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.json({ user: null });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch {
    res.json({ user: null });
  }
});

export default router;
