import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuredOrigins = (
    process.env.FRONTEND_URLS ??
    process.env.FRONTEND_URL ??
    "http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: configuredOrigins,
    credentials: true,
  });

  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

void bootstrap();
