import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const prisma = new PrismaClient();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.set("etag", false);

app.use("/uploads", express.static(process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads")));

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import categoryRoutes from "./routes/categories";
import orderRoutes from "./routes/orders";
import checkoutRoutes from "./routes/checkout";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import ecomdzRoutes from "./routes/ecomdz";
import wilayaRoutes from "./routes/wilayas";

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/ecomdz", ecomdzRoutes);
app.use("/api/admin/wilayas", wilayaRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
