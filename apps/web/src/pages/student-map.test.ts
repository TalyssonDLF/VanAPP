import { describe, expect, it } from "vitest";
import {
  createSchoolIcon,
  createStudentIcon,
  createVehicleIcon,
  isStudentLocated,
  locationReason,
  toValidCoordinate,
} from "./student-map";
import type { StudentMapItem } from "@/lib/api/resources";

const student = (
  addressDetails: StudentMapItem["addressDetails"],
): StudentMapItem => ({
  id: "student-1",
  name: "Ana",
  status: "ACTIVE",
  order: 1,
  address: null,
  addressDetails,
});

describe("student map location rules", () => {
  it("builds real SVG HTML for every custom DivIcon", () => {
    const options: Array<Record<string, unknown>> = [];
    const leaflet = {
      divIcon: (value: Record<string, unknown>) => {
        options.push(value);
        return value;
      },
    };
    createStudentIcon(leaflet as never, "#2563eb");
    createSchoolIcon(leaflet as never, "#16a34a");
    createVehicleIcon(leaflet as never);

    expect(options).toHaveLength(3);
    expect(options.map(({ html }) => html)).toEqual([
      expect.stringContaining('<svg viewBox="0 0 24 24"'),
      expect.stringContaining('<svg viewBox="0 0 24 24"'),
      expect.stringContaining('<svg viewBox="0 0 24 24"'),
    ]);
    expect(options.map(({ className }) => className)).toEqual([
      expect.stringContaining("map-student-icon"),
      expect.stringContaining("map-school-icon"),
      expect.stringContaining("map-vehicle-icon"),
    ]);
  });
  it("normalizes numeric coordinate payloads and rejects invalid ranges", () => {
    expect(toValidCoordinate("-25.4", 90)).toBe(-25.4);
    expect(toValidCoordinate(0, 180)).toBe(0);
    expect(toValidCoordinate("", 90)).toBeNull();
    expect(toValidCoordinate("not-a-number", 180)).toBeNull();
    expect(toValidCoordinate(91, 90)).toBeNull();
    expect(toValidCoordinate(-181, 180)).toBeNull();
  });
  it("creates markers only for finite, valid coordinates", () => {
    expect(
      isStudentLocated(
        student({
          street: "Rua A",
          city: "Curitiba",
          state: "PR",
          latitude: -25.4,
          longitude: -49.2,
        }),
      ),
    ).toBe(true);
    expect(
      isStudentLocated(
        student({
          street: "Rua A",
          city: "Curitiba",
          state: "PR",
          latitude: NaN,
          longitude: -49.2,
        }),
      ),
    ).toBe(false);
    expect(isStudentLocated(student(null))).toBe(false);
  });

  it("distinguishes missing, pending, and failed addresses", () => {
    expect(locationReason(student(null))).toBe("Sem endereço");
    expect(
      locationReason(
        student({
          street: "Rua A",
          city: "Curitiba",
          state: "PR",
          geocodingStatus: "PENDING",
        }),
      ),
    ).toBe("Aguardando geocoding");
    expect(
      locationReason(
        student({
          street: "Rua A",
          city: "Curitiba",
          state: "PR",
          geocodingStatus: "FAILED",
          geocodingError: "Endereço incompleto",
        }),
      ),
    ).toBe("Endereço incompleto");
  });
});
