import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { Server } from "node:http";
import { request } from "node:http";
import { configureCors, getConfiguredOrigins } from "../src/cors";

@Module({})
class CorsTestModule {}

describe("API CORS bootstrap configuration", () => {
  it("always includes official origins and merges configured origins", () => {
    expect(
      getConfiguredOrigins({
        FRONTEND_URLS: " https://extra.example,https://vanapp-front.onrender.com ",
      }),
    ).toEqual([
      "http://localhost:5173",
      "https://vanapp-front.onrender.com",
      "https://extra.example",
    ]);
  });

  it("answers the production frontend login preflight with credentials", async () => {
    const app = await NestFactory.create(CorsTestModule, { logger: false });
    configureCors(app);
    await app.listen(0, "127.0.0.1");

    try {
      const address = (app.getHttpServer() as Server).address();
      if (!address || typeof address === "string") {
        throw new Error("Test server did not expose a TCP port");
      }

      const response = await new Promise<{
        statusCode?: number;
        headers: Record<string, string | string[] | undefined>;
      }>((resolve, reject) => {
        const req = request(
          {
            host: "127.0.0.1",
            port: address.port,
            path: "/auth/login",
            method: "OPTIONS",
            headers: {
              Origin: "https://vanapp-front.onrender.com",
              "Access-Control-Request-Method": "POST",
              "Access-Control-Request-Headers": "content-type",
            },
          },
          (res) => {
            res.resume();
            res.on("end", () =>
              resolve({ statusCode: res.statusCode, headers: res.headers }),
            );
          },
        );
        req.on("error", reject);
        req.end();
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://vanapp-front.onrender.com",
      );
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    } finally {
      await app.close();
    }
  });
});
