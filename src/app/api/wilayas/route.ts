import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wilayas = await prisma.wilaya.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(wilayas);
  } catch {
    console.error("Failed to fetch wilayas");
    return NextResponse.json({ error: "Failed to fetch wilayas" }, { status: 500 });
  }
}
