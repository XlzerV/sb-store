import { Router } from "express";
import { prisma } from "../index";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const wilayas = await prisma.wilaya.findMany({ orderBy: { id: "asc" } });
    res.json(wilayas);
  } catch {
    res.status(500).json({ error: "Failed to fetch wilayas" });
  }
});

router.get("/:id/communes", async (req, res) => {
  try {
    const communes = await prisma.commune.findMany({
      where: { wilayaId: parseInt(req.params.id) },
      orderBy: { name: "asc" },
    });
    res.json(communes);
  } catch {
    res.status(500).json({ error: "Failed to fetch communes" });
  }
});

export default router;
