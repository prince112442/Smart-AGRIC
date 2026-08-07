import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { predictYield, recommendIrrigation } from "@/lib/ml";

const DAY = 24 * 60 * 60 * 1000;
const CROP_TYPES = ["maize", "cassava", "tomato"];

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function round1(v: number) {
  return Math.round(v * 10) / 10;
}

/**
 * Generates 30 days of historical soil, weather, irrigation, yield, and pest
 * data for a farm — so the dashboard and analytics charts have something
 * real to show without manually logging a month of readings by hand.
 * Every number still runs through the same predictYield()/recommendIrrigation()
 * functions the rest of the app uses, so the "demo" data behaves exactly
 * like data a real farmer would have entered.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const farm = await prisma.farm.findUnique({ where: { id: params.id } });
  if (!farm || farm.userId !== user.userId) {
    return NextResponse.json({ error: "Farm not found" }, { status: 404 });
  }

  const cropType = CROP_TYPES[Math.floor(Math.random() * CROP_TYPES.length)];
  const now = Date.now();

  const soilRows: any[] = [];
  const weatherRows: any[] = [];
  const irrigationRows: any[] = [];
  const yieldRows: any[] = [];
  const pestRows: any[] = [];

  // Slowly-drifting baseline values with daily noise and occasional rain
  // resets, so the resulting charts look like a real month, not flat noise.
  let moisture = 45;
  let ph = 6.4;
  let nitrogen = 55;
  let phosphorus = 28;
  let potassium = 38;
  let temperature = 27;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now - i * DAY);
    const rain = Math.random() < 0.25 ? Math.round(Math.random() * 25) : 0;

    moisture = rain > 0 ? Math.min(65, moisture + rain * 0.8) : Math.max(18, moisture - (2 + Math.random() * 3));
    temperature = 25 + Math.sin(i / 5) * 3 + (Math.random() * 2 - 1);
    const humidity = 55 + Math.random() * 25;
    ph = clamp(ph + (Math.random() * 0.2 - 0.1), 5.5, 7.5);
    nitrogen = clamp(nitrogen + (Math.random() * 4 - 2), 20, 80);
    phosphorus = clamp(phosphorus + (Math.random() * 3 - 1.5), 10, 45);
    potassium = clamp(potassium + (Math.random() * 3 - 1.5), 15, 55);

    soilRows.push({
      farmId: farm.id,
      moisture: round1(moisture),
      temperature: round1(temperature),
      ph: round1(ph),
      nitrogen: round1(nitrogen),
      phosphorus: round1(phosphorus),
      potassium: round1(potassium),
      source: "manual",
      recordedAt: date,
    });

    weatherRows.push({
      farmId: farm.id,
      temperature: round1(temperature),
      humidity: round1(humidity),
      rainfall: rain,
      forecast: rain > 0 ? "Rain expected" : "Clear",
      recordedAt: date,
    });

    if (i % 4 === 0) {
      const rec = recommendIrrigation({ soilMoisture: moisture, temperature, forecastRainfallMm: rain });
      irrigationRows.push({
        farmId: farm.id,
        waterUsageL: rec.recommendation === "Irrigate" ? rec.amountLPerHa : 0,
        recommendation: rec.recommendation,
        amountLPerHa: rec.amountLPerHa,
        createdAt: date,
      });
    }

    if (i % 7 === 0) {
      const pred = predictYield({
        moisture,
        temperature,
        ph,
        nitrogen,
        phosphorus,
        potassium,
        rainfall: rain,
        humidity,
        cropType,
        farmSizeHa: farm.sizeHa,
      });
      yieldRows.push({
        farmId: farm.id,
        cropType,
        predictedYield: pred.predictedYield,
        confidence: pred.confidence,
        soilHealth: pred.soilHealth,
        createdAt: date,
      });
    }

    if (i === 18) {
      pestRows.push({
        farmId: farm.id,
        pestType: "Fall armyworm",
        severity: "medium",
        treatment: "Applied neem-based spray",
        reportedAt: date,
      });
    }
    if (i === 6) {
      pestRows.push({
        farmId: farm.id,
        diseaseType: "Leaf blight",
        severity: "low",
        reportedAt: date,
      });
    }
  }

  await prisma.$transaction([
    prisma.soilReading.createMany({ data: soilRows }),
    prisma.weatherData.createMany({ data: weatherRows }),
    prisma.irrigation.createMany({ data: irrigationRows }),
    prisma.yieldPrediction.createMany({ data: yieldRows }),
    prisma.pestReport.createMany({ data: pestRows }),
    prisma.crop.create({
      data: {
        farmId: farm.id,
        cropType,
        plantingDate: new Date(now - 45 * DAY),
        growthStage: "growing",
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    days: 30,
    cropType,
    counts: {
      soil: soilRows.length,
      weather: weatherRows.length,
      irrigation: irrigationRows.length,
      yield: yieldRows.length,
      pests: pestRows.length,
    },
  });
}
