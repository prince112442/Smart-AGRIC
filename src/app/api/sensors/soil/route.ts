import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Phase 8 — IoT readiness. No physical hardware required today: an ESP32 or
 * Raspberry Pi (or, for now, a curl command / Postman) can push a reading
 * here using a per-farm sensor key instead of a user login.
 *
 * Example:
 *   curl -X POST https://yourapp.vercel.app/api/sensors/soil \
 *     -H "x-sensor-key: <FARM_SENSOR_KEY>" -H "Content-Type: application/json" \
 *     -d '{"farmId":"...","moisture":45,"temperature":28,"ph":6.5,"nitrogen":50,"phosphorus":25,"potassium":35}'
 *
 * For the capstone demo, SENSOR_KEY is a single shared secret (env var).
 * In a production IoT rollout, generate one key per farm/device instead.
 */
export async function POST(req: NextRequest) {
  const key = req.headers.get("x-sensor-key");
  if (!process.env.SENSOR_KEY || key !== process.env.SENSOR_KEY) {
    return NextResponse.json({ error: "Invalid or missing sensor key" }, { status: 401 });
  }

  const body = await req.json();
  const { farmId, moisture, temperature, ph, nitrogen, phosphorus, potassium } = body;
  if (!farmId || [moisture, temperature, ph, nitrogen, phosphorus, potassium].some((v) => v === undefined)) {
    return NextResponse.json({ error: "farmId, moisture, temperature, ph, nitrogen, phosphorus, potassium are required" }, { status: 400 });
  }

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm) return NextResponse.json({ error: "Unknown farmId" }, { status: 404 });

  const reading = await prisma.soilReading.create({
    data: { farmId, moisture, temperature, ph, nitrogen, phosphorus, potassium, source: "sensor" },
  });

  return NextResponse.json(reading, { status: 201 });
}
