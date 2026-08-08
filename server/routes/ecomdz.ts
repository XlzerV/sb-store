import { Router } from "express";

const router = Router();
const API_KEY = process.env.ECOMDZ_API_KEY || "e9c9914fb6424fd6b2f02e3da52157d3";
const API_TOKEN = process.env.ECOMDZ_TOKEN || "ef78970b-4527-4352-ae25-20cc2ede1e27";
const BASE_URL = "https://api.ecom-dz.com/v1";

async function ecomdzFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "X-API-Key": API_KEY,
    "X-Auth-Token": API_TOKEN,
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ecom-dz API error ${res.status}: ${text}`);
  }
  return res.json();
}

router.get("/pricing", async (req, res) => {
  try {
    const { wilayaId } = req.query;
    let endpoint = "/delivery/pricing";
    if (wilayaId) endpoint += `?wilaya_id=${wilayaId}`;
    const data = await ecomdzFetch(endpoint);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

router.post("/create-delivery", async (req, res) => {
  try {
    const data = await ecomdzFetch("/deliveries", {
      method: "POST",
      body: JSON.stringify(req.body),
    });
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

router.get("/track/:id", async (req, res) => {
  try {
    const data = await ecomdzFetch(`/deliveries/${req.params.id}/track`);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

export default router;
