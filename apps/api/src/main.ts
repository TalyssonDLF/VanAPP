import "reflect-metadata";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureCors, getConfiguredOrigins } from "./cors";

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

  const configuredOrigins = getConfiguredOrigins();
  configureCors(app, configuredOrigins);

  console.log("[CORS] allowed origins:", configuredOrigins);
  console.log("[ENV] NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "[ENV] FRONTEND_URLS defined:",
    Boolean(process.env.FRONTEND_URLS),
  );
  console.log(
    "[ENV] FRONTEND_URL defined:",
    Boolean(process.env.FRONTEND_URL),
  );

  await app.listen(Number(process.env.PORT ?? 3000), "0.0.0.0");
}

void bootstrap();
