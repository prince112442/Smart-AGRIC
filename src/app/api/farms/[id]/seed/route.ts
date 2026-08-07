import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateDemoDataForFarm } from "@/lib/demoSeed";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farm = await prisma.farm.findUnique({ where: { id: params.id } });
  if (!farm || farm.userId !== user.userId) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }

  const result = await generateDemoDataForFarm(farm);
  return NextResponse.json({ success: true, days: 30, ...result });
}
