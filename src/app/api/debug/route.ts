import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    const count = await prisma.user.count();
    return NextResponse.json({ dbConnected: true, userCount: count, nodeEnv: process.env.NODE_ENV });
  } catch (error: any) {
    return NextResponse.json({ dbConnected: false, error: error?.message }, { status: 500 });
  }
}
