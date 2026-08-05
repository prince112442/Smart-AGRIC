import { prisma } from "@/lib/prisma";
import { makeFarmResourceHandlers } from "@/lib/resource";

export const { GET, POST } = makeFarmResourceHandlers(prisma.weatherData, "recordedAt");
