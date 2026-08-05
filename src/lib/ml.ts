/**
 * AI / Prediction module (Phase 6 — Pattern Recognition).
 *
 * These are transparent, rule-and-heuristic based models rather than a
 * trained scikit-learn model, so the whole system runs with zero external
 * ML infrastructure and is trivial to deploy. Each function documents the
 * "features" it uses (same inputs a real regression/classification model
 * would take), so this module can be swapped for a real trained model later
 * without changing any API route — see README "Upgrading to a trained model".
 */

export type SoilInput = {
  moisture: number; // %
  temperature: number; // C
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

export type YieldInput = SoilInput & {
  rainfall: number; // mm
  humidity: number; // %
  cropType: string;
  farmSizeHa: number;
  fertilizerKgPerHa?: number;
};

// Baseline expected yield per crop (tons/ha) under ideal conditions.
const CROP_BASELINE_YIELD: Record<string, number> = {
  maize: 6.0,
  rice: 5.5,
  wheat: 4.5,
  cassava: 12.0,
  tomato: 25.0,
  default: 5.0,
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Model 3: Soil Health Classification -> Healthy | Medium | Poor */
export function classifySoilHealth(soil: SoilInput): "Healthy" | "Medium" | "Poor" {
  let score = 0;
  if (soil.ph >= 6.0 && soil.ph <= 7.5) score += 2;
  else if (soil.ph >= 5.5 && soil.ph <= 8.0) score += 1;

  if (soil.moisture >= 30 && soil.moisture <= 60) score += 2;
  else if (soil.moisture >= 20 && soil.moisture <= 70) score += 1;

  if (soil.nitrogen >= 40) score += 1;
  if (soil.phosphorus >= 20) score += 1;
  if (soil.potassium >= 30) score += 1;

  if (score >= 6) return "Healthy";
  if (score >= 3) return "Medium";
  return "Poor";
}

/** Model 1: Yield Prediction -> { predictedYield, confidence } */
export function predictYield(input: YieldInput): { predictedYield: number; confidence: number; soilHealth: string } {
  const baseline = CROP_BASELINE_YIELD[input.cropType.toLowerCase()] ?? CROP_BASELINE_YIELD.default;
  const soilHealth = classifySoilHealth(input);

  // Multiplicative factors around 1.0, each nudged by how far the input is
  // from its agronomic "sweet spot".
  const phFactor = 1 - Math.abs(input.ph - 6.5) * 0.06;
  const moistureFactor = 1 - Math.abs(input.moisture - 45) * 0.008;
  const tempFactor = 1 - Math.abs(input.temperature - 24) * 0.01;
  const rainFactor = clamp(input.rainfall / 120, 0.5, 1.2);
  const humidityFactor = 1 - Math.abs(input.humidity - 60) * 0.004;
  const npkFactor =
    0.85 +
    clamp(input.nitrogen / 80, 0, 1) * 0.08 +
    clamp(input.phosphorus / 40, 0, 1) * 0.04 +
    clamp(input.potassium / 60, 0, 1) * 0.03;
  const fertilizerFactor = input.fertilizerKgPerHa
    ? 1 + clamp(input.fertilizerKgPerHa / 300, 0, 0.15)
    : 1;

  const combined =
    phFactor * moistureFactor * tempFactor * rainFactor * humidityFactor * npkFactor * fertilizerFactor;

  const predictedYield = Math.max(0.2, baseline * clamp(combined, 0.3, 1.4));

  // Confidence: higher when inputs sit close to agronomic norms (less extrapolation).
  const deviation =
    Math.abs(input.ph - 6.5) / 6.5 +
    Math.abs(input.moisture - 45) / 45 +
    Math.abs(input.temperature - 24) / 24;
  const confidence = clamp(0.95 - deviation * 0.25, 0.4, 0.95);

  return {
    predictedYield: Math.round(predictedYield * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    soilHealth,
  };
}

/** Model 2: Irrigation Recommendation -> Irrigate | Wait + amount */
export function recommendIrrigation(params: {
  soilMoisture: number;
  temperature: number;
  forecastRainfallMm: number;
}): { recommendation: "Irrigate" | "Wait"; amountLPerHa: number; reason: string } {
  const { soilMoisture, temperature, forecastRainfallMm } = params;

  if (forecastRainfallMm >= 10) {
    return {
      recommendation: "Wait",
      amountLPerHa: 0,
      reason: `Rain of ${forecastRainfallMm}mm expected — irrigation is unnecessary right now.`,
    };
  }

  if (soilMoisture < 30) {
    const deficit = 30 - soilMoisture;
    const heatBoost = temperature > 30 ? 1.2 : 1.0;
    const amount = Math.round(deficit * 350 * heatBoost); // L/ha, rough heuristic
    return {
      recommendation: "Irrigate",
      amountLPerHa: amount,
      reason: `Soil moisture is low (${soilMoisture}%) and no significant rain is forecast.`,
    };
  }

  return {
    recommendation: "Wait",
    amountLPerHa: 0,
    reason: `Soil moisture (${soilMoisture}%) is within a healthy range.`,
  };
}
