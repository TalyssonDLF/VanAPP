import { Injectable } from "@nestjs/common";

export type GeocodingResult = { latitude: number; longitude: number } | null;

/** Provider boundary for persisted address coordinates. Uses Nominatim conservatively. */
@Injectable()
export class GeocodingService {
  private nextRequestAt = 0;

  async geocode(address: string): Promise<GeocodingResult> {
    const wait = Math.max(0, this.nextRequestAt - Date.now());
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    this.nextRequestAt = Date.now() + 1100;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", address);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "br");
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          process.env.GEOCODING_USER_AGENT ||
          "VanEscolar/1.0 (configure GEOCODING_USER_AGENT)",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok)
      throw new Error(`Geocoding provider returned ${response.status}`);
    const [first] = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;
    if (!first) return null;
    const latitude = Number(first.lat),
      longitude = Number(first.lon);
    return Number.isFinite(latitude) &&
      Number.isFinite(longitude) &&
      Math.abs(latitude) <= 90 &&
      Math.abs(longitude) <= 180
      ? { latitude, longitude }
      : null;
  }
}
