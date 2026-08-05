import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farms = await prisma.farm.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(farms);
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, location, sizeHa, latitude, longitude } = await req.json();
  if (!name || !location || !sizeHa) {
    return NextResponse.json({ error: "name, location and sizeHa are required" }, { status: 400 });
  }

  const farm = await prisma.farm.create({
    data: { name, location, sizeHa, latitude, longitude, userId: user.userId },
  });
  return NextResponse.json(farm, { status: 201 });
}
