import { Router } from "express";
import { requireAdmin } from "../middleware/auth";

const router = Router();
const BASE_URL = "https://api.ecom-dz.com/v1";

function credentials() {
  const key = process.env.ECOMDZ_API_KEY;
  const token = process.env.ECOMDZ_TOKEN;
  if (!key || !token) {
    throw new Error("ECOMDZ_API_KEY / ECOMDZ_TOKEN are not configured");
  }
  return { key, token };
}

async function ecomdzFetch(endpoint: string, options: RequestInit = {}) {
  const { key, token } = credentials();
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "X-API-Key": key,
    "X-Auth-Token": token,
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ecom-dz API error ${res.status}: ${text}`);
  }
  return res.json();
}

router.get("/pricing", requireAdmin, async (req, res) => {
  try {
    const { wilayaId } = req.query;
    let endpoint = "/delivery/pricing";
    if (wilayaId) endpoint += `?wilaya_id=${wilayaId}`;
    const data = await ecomdzFetch(endpoint);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || "Failed to fetch pricing" });
  }
});

router.post("/create-delivery", requireAdmin, async (req, res) => {
  try {
    const data = await ecomdzFetch("/deliveries", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || "Failed to create delivery" });
  }
});

router.get("/track/:id", requireAdmin, async (req, res) => {
  try {
    const data = await ecomdzFetch(`/deliveries/${req.params.id}/track`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message || "Failed to track delivery" });
  }
});

export default router;
