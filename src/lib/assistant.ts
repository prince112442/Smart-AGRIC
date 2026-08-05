import { prisma } from "./prisma";
import { classifySoilHealth, recommendIrrigation } from "./ml";

/**
 * AI Farm Assistant. Intent is detected with simple keyword matching, then
 * the answer is generated from the farm's actual latest records — this is
 * what makes it "understand farm information" as required by the spec,
 * without needing an external LLM API key to run. Swap the `answer()` body
 * for a call to an LLM (passing the same retrieved context) for richer
 * natural-language answers later — see README.
 */
export async function answerFarmQuestion(farmId: string, question: string): Promise<string> {
  const q = question.toLowerCase();

  const [soil, weather, yieldPred, crop] = await Promise.all([
    prisma.soilReading.findFirst({ where: { farmId }, orderBy: { recordedAt: "desc" } }),
    prisma.weatherData.findFirst({ where: { farmId }, orderBy: { recordedAt: "desc" } }),
    prisma.yieldPrediction.findFirst({ where: { farmId }, orderBy: { createdAt: "desc" } }),
    prisma.crop.findFirst({ where: { farmId }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!soil && !weather) {
    return "I don't have any soil or weather readings for this farm yet. Add a soil reading or weather record first, and I'll be able to give you real recommendations.";
  }

  if (q.includes("irrigat") || q.includes("water")) {
    if (!soil) return "I need at least one soil moisture reading to advise on irrigation.";
    const rec = recommendIrrigation({
      soilMoisture: soil.moisture,
      temperature: weather?.temperature ?? soil.temperature,
      forecastRainfallMm: weather?.rainfall ?? 0,
    });
    return rec.recommendation === "Irrigate"
      ? `Yes — irrigate today. ${rec.reason} Recommended amount: ~${rec.amountLPerHa} L/ha.`
      : `No need to irrigate right now. ${rec.reason}`;
  }

  if (q.includes("yield") && (q.includes("decreas") || q.includes("low") || q.includes("why"))) {
    if (!soil) return "I don't have soil data yet to explain yield changes.";
    const health = classifySoilHealth(soil);
    const issues: string[] = [];
    if (soil.ph < 6 || soil.ph > 7.5) issues.push(`soil pH is ${soil.ph} (ideal is 6.0–7.5)`);
    if (soil.moisture < 30) issues.push(`soil moisture is low at ${soil.moisture}%`);
    if (soil.nitrogen < 40) issues.push("nitrogen levels are below the recommended range");
    const reason = issues.length
      ? `Likely causes: ${issues.join("; ")}.`
      : "Your soil readings look reasonable — check pest reports or recent weather stress.";
    return `Soil health is currently classified as ${health}. ${reason}`;
  }

  if (q.includes("soil") && (q.includes("condition") || q.includes("health") || q.includes("status"))) {
    if (!soil) return "No soil readings recorded yet for this farm.";
    const health = classifySoilHealth(soil);
    return `Latest soil reading: moisture ${soil.moisture}%, pH ${soil.ph}, temperature ${soil.temperature}°C, N-P-K ${soil.nitrogen}/${soil.phosphorus}/${soil.potassium} mg/kg. Overall soil health: ${health}.`;
  }

  if (q.includes("fertiliz")) {
    if (!soil) return "I need a soil reading (N-P-K values) to recommend fertilizer.";
    const tips: string[] = [];
    if (soil.nitrogen < 40) tips.push("nitrogen-rich fertilizer (e.g. urea) to boost leafy growth");
    if (soil.phosphorus < 20) tips.push("a phosphorus supplement to support root and flower development");
    if (soil.potassium < 30) tips.push("potassium (e.g. potash) to improve disease resistance and fruit quality");
    return tips.length
      ? `Based on your latest soil readings, consider: ${tips.join("; ")}.`
      : "Your N-P-K levels look adequate — a balanced maintenance fertilizer should be enough.";
  }

  if (q.includes("yield") || q.includes("predict")) {
    if (!yieldPred) return "No yield prediction has been generated yet — submit your farm's soil, weather, and crop data on the Yield Prediction page to get one.";
    return `Latest prediction for ${yieldPred.cropType}: ${yieldPred.predictedYield} tons/ha (confidence ${(yieldPred.confidence * 100).toFixed(0)}%), based on soil health rated "${yieldPred.soilHealth}".`;
  }

  if (q.includes("weather")) {
    if (!weather) return "No weather data recorded yet for this farm.";
    return `Latest weather: ${weather.temperature}°C, ${weather.humidity}% humidity, ${weather.rainfall}mm rainfall${weather.forecast ? `, forecast: ${weather.forecast}` : ""}.`;
  }

  // Fallback: general status summary
  const parts: string[] = [];
  if (crop) parts.push(`Current crop: ${crop.cropType} (stage: ${crop.growthStage}).`);
  if (soil) parts.push(`Soil moisture ${soil.moisture}%, pH ${soil.ph}.`);
  if (weather) parts.push(`Weather: ${weather.temperature}°C, ${weather.rainfall}mm rain.`);
  return `I'm not sure exactly what you're asking, but here's your farm's current status: ${parts.join(" ")} Try asking about irrigation, yield, soil condition, or fertilizer.`;
}
