import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { generateDemoDataForFarm, GHANA_DEMO_FARMS } from "@/lib/demoSeed";

/**
 * Creates several Ghanaian-named demo farms for the logged-in user in one
 * click, each already carrying 30 days of soil/weather/irrigation/yield/pest
 * history — so a brand new account has something real to show immediately
 * instead of a blank dashboard.
 */
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const created: any[] = [];

  for (const demo of GHANA_DEMO_FARMS) {
    const farm = await prisma.farm.create({
      data: {
        userId: user.userId,
        name: demo.name,
        location: demo.location,
        sizeHa: demo.sizeHa,
      },
    });
    const result = await generateDemoDataForFarm(farm);
    created.push({ farmId: farm.id, name: farm.name, ...result });
  }

  return NextResponse.json({ success: true, farms: created });
}
