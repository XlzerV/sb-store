import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ wilayaId: string }> }
) {
  const { wilayaId } = await params;
  try {
    const communes = await prisma.commune.findMany({
      where: { wilayaId: parseInt(wilayaId) },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(communes);
  } catch {
    console.error(`Failed to fetch communes for wilaya ${wilayaId}`);
    return NextResponse.json({ error: "Failed to fetch communes" }, { status: 500 });
  }
}
