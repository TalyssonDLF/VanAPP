import { StudentsService } from "../src/students/students.service";

describe("StudentsService map data", () => {
  it("returns only map-safe student fields and stable waypoint order", async () => {
    const prisma = {
      student: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            {
              id: "s1",
              name: "Ana",
              status: "ACTIVE",
              address: {
                street: "Rua A",
                number: "10",
                complement: null,
                neighborhood: "Centro",
                city: "Curitiba",
                state: "PR",
                postalCode: "80000000",
                latitude: -25.4,
                longitude: -49.2,
                geocodingStatus: "LOCATED",
                geocodingError: null,
              },
            },
          ]),
      },
      vehicle: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new StudentsService(prisma as never, {} as never);
    const result = await service.mapData();
    expect(result.students[0]).toEqual(
      expect.objectContaining({ id: "s1", name: "Ana", order: 1 }),
    );
    expect(result.students[0]).not.toHaveProperty("document");
    expect(result.students[0].addressDetails?.latitude).toBe(-25.4);
  });

  it("keeps students without coordinates for the missing-location counter", async () => {
    const prisma = {
      student: {
        findMany: jest
          .fn()
          .mockResolvedValue([
            { id: "s2", name: "Bia", status: "ACTIVE", address: null },
          ]),
      },
      vehicle: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const result = await new StudentsService(
      prisma as never,
      {} as never,
    ).mapData();
    expect(result.students[0].addressDetails).toBeNull();
  });
});
