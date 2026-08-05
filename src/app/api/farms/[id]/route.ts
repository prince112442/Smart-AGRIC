import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farm = await prisma.farm.findUnique({
    where: { id: params.id },
    include: {
      crops: { orderBy: { createdAt: "desc" }, take: 5 },
      soilReadings: { orderBy: { recordedAt: "desc" }, take: 5 },
      weatherData: { orderBy: { recordedAt: "desc" }, take: 5 },
      yieldPredictions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!farm || farm.userId !== user.userId) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }
  return NextResponse.json(farm);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farm = await prisma.farm.findUnique({ where: { id: params.id } });
  if (!farm || farm.userId !== user.userId) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }

  await prisma.farm.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
