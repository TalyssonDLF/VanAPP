import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./client";

describe("central API client", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("includes credentials for login and protected requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({}),
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn(),
    });

    await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com", password: "secret" }),
    });
    await api("/finance/transactions");

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/auth/login"),
      expect.objectContaining({ credentials: "include" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/finance/transactions"),
      expect.objectContaining({ credentials: "include" }),
    );
  });
});
