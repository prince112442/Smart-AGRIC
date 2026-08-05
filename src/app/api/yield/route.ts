import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { predictYield } from "@/lib/ml";

async function assertFarmOwnership(farmId: string, userId: string) {
  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  return !!farm && farm.userId === userId;
}

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farmId = req.nextUrl.searchParams.get("farmId");
  if (!farmId) return NextResponse.json({ error: "farmId query param is required" }, { status: 400 });
  if (!(await assertFarmOwnership(farmId, user.userId)))
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });

  const records = await prisma.yieldPrediction.findMany({
    where: { farmId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(records);
}

/**
 * Body: { farmId, cropType, moisture, temperature, ph, nitrogen, phosphorus,
 *         potassium, rainfall, humidity, farmSizeHa, fertilizerKgPerHa? }
 */
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { farmId, cropType } = body;
  if (!farmId || !cropType) {
    return NextResponse.json({ error: "farmId and cropType are required" }, { status: 400 });
  }
  if (!(await assertFarmOwnership(farmId, user.userId)))
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });

  const required = ["moisture", "temperature", "ph", "nitrogen", "phosphorus", "potassium", "rainfall", "humidity", "farmSizeHa"];
  for (const field of required) {
    if (body[field] === undefined) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const result = predictYield({
    moisture: body.moisture,
    temperature: body.temperature,
    ph: body.ph,
    nitrogen: body.nitrogen,
    phosphorus: body.phosphorus,
    potassium: body.potassium,
    rainfall: body.rainfall,
    humidity: body.humidity,
    cropType,
    farmSizeHa: body.farmSizeHa,
    fertilizerKgPerHa: body.fertilizerKgPerHa,
  });

  const record = await prisma.yieldPrediction.create({
    data: {
      farmId,
      cropType,
      predictedYield: result.predictedYield,
      confidence: result.confidence,
      soilHealth: result.soilHealth,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
