import type { INestApplication } from "@nestjs/common";

export const defaultOrigins = [
  "http://localhost:5173",
  "https://vanapp-front.onrender.com",
];

export function getConfiguredOrigins(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const envOrigins = (env.FRONTEND_URLS ?? env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...defaultOrigins, ...envOrigins]));
}

export function configureCors(
  app: INestApplication,
  configuredOrigins = getConfiguredOrigins(),
): void {
  app.enableCors({
    origin: configuredOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    maxAge: 86400,
    optionsSuccessStatus: 204,
  });
}
