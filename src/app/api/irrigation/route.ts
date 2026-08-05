import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { recommendIrrigation } from "@/lib/ml";

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

  const records = await prisma.irrigation.findMany({
    where: { farmId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(records);
}

/** Body: { farmId, soilMoisture, temperature, forecastRainfallMm, waterUsageL? } */
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { farmId, soilMoisture, temperature, forecastRainfallMm, waterUsageL } = body;
  if (!farmId || soilMoisture === undefined || temperature === undefined) {
    return NextResponse.json(
      { error: "farmId, soilMoisture and temperature are required" },
      { status: 400 }
    );
  }
  if (!(await assertFarmOwnership(farmId, user.userId)))
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });

  const rec = recommendIrrigation({
    soilMoisture,
    temperature,
    forecastRainfallMm: forecastRainfallMm ?? 0,
  });

  const record = await prisma.irrigation.create({
    data: {
      farmId,
      waterUsageL: waterUsageL ?? 0,
      recommendation: rec.recommendation,
      amountLPerHa: rec.amountLPerHa,
    },
  });

  return NextResponse.json({ ...record, reason: rec.reason }, { status: 201 });
}
