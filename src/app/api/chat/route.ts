import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { answerFarmQuestion } from "@/lib/assistant";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farmId = req.nextUrl.searchParams.get("farmId");
  const history = await prisma.chatMessage.findMany({
    where: { userId: user.userId, ...(farmId ? { farmId } : {}) },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { farmId, message } = await req.json();
  if (!farmId || !message) {
    return NextResponse.json({ error: "farmId and message are required" }, { status: 400 });
  }

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm || farm.userId !== user.userId) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }

  const response = await answerFarmQuestion(farmId, message);

  const saved = await prisma.chatMessage.create({
    data: { userId: user.userId, farmId, message, response },
  });

  return NextResponse.json(saved, { status: 201 });
}
