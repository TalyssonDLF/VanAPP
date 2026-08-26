import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, AUTH_SESSION_EXPIRED_EVENT } from "./client";

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

  it("standardizes protected 401 errors and announces session expiry", async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: "internal detail" }),
    }));
    vi.stubGlobal("window", {
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn(),
      dispatchEvent,
    });

    await expect(api("/students")).rejects.toEqual(
      new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401),
    );
    expect(dispatchEvent.mock.calls[0][0].type).toBe(AUTH_SESSION_EXPIRED_EVENT);
  });

  it("distinguishes forbidden and server errors", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 403, json: vi.fn().mockResolvedValue({}) })
      .mockResolvedValueOnce({ ok: false, status: 503, json: vi.fn().mockResolvedValue({}) });
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("window", {
      setTimeout: vi.fn().mockReturnValue(1),
      clearTimeout: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    await expect(api("/reports")).rejects.toMatchObject({
      status: 403,
      message: "Você não possui permissão para acessar este recurso.",
    });
    await expect(api("/reports")).rejects.toMatchObject({
      status: 503,
      message: "Não foi possível concluir a operação. Tente novamente.",
    });
  });
});
