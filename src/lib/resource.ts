import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getAuthUser } from "./auth";

/**
 * Every farm sub-resource (soil readings, weather, irrigation, crops, pest
 * reports) shares the same shape of API: list-by-farm, create-for-farm, all
 * gated by "does this user own this farm". Abstracting that into one
 * factory (Computational Thinking: Abstraction) avoids five near-identical
 * copies of the same route handler.
 */
export function makeFarmResourceHandlers<T extends { farmId: string }>(
  model: any,
  orderByField: string
) {
  async function assertFarmOwnership(farmId: string, userId: string) {
    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.userId !== userId) return false;
    return true;
  }

  async function GET(req: NextRequest) {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const farmId = req.nextUrl.searchParams.get("farmId");
    if (!farmId) return NextResponse.json({ error: "farmId query param is required" }, { status: 400 });

    const owns = await assertFarmOwnership(farmId, user.userId);
    if (!owns) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

    const records = await model.findMany({
      where: { farmId },
      orderBy: { [orderByField]: "desc" },
      take: 100,
    });
    return NextResponse.json(records);
  }

  async function POST(req: NextRequest) {
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    if (!body.farmId) return NextResponse.json({ error: "farmId is required" }, { status: 400 });

    const owns = await assertFarmOwnership(body.farmId, user.userId);
    if (!owns) return NextResponse.json({ error: "Farm not found" }, { status: 404 });

    try {
      const record = await model.create({ data: body });
      return NextResponse.json(record, { status: 201 });
    } catch (err) {
      console.error(err);
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }
  }

  return { GET, POST };
}
