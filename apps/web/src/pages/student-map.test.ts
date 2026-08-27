import { describe, expect, it } from "vitest";
import { isStudentLocated, locationReason } from "./student-map";
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
