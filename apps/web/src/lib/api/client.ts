const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(
  /\/$/,
  "",
);
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  throw new Error("VITE_API_URL must be configured for a production build.");
}
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
export class ApiNetworkError extends Error {}

export const AUTH_SESSION_EXPIRED_EVENT = "vanescolar:session-expired";

const errorMessage = (status: number, serverMessage?: string, path?: string) => {
  if (status === 401) {
    return path === "/auth/login"
      ? (serverMessage ?? "E-mail ou senha inválidos.")
      : "Sua sessão expirou. Entre novamente para continuar.";
  }
  if (status === 403)
    return "Você não possui permissão para acessar este recurso.";
  if (status >= 500)
    return "Não foi possível concluir a operação. Tente novamente.";
  return serverMessage ?? "Não foi possível concluir a solicitação.";
};

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    const hasBody = init?.body !== undefined;
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      signal: init?.signal ?? controller.signal,
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("API request failed", { path, error });
    throw new ApiNetworkError(
      error instanceof DOMException && error.name === "AbortError"
        ? "A solicitação demorou demais. Tente novamente."
        : "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    );
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
    };
    if (response.status === 401 && !path.startsWith("/auth/")) {
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
    throw new ApiError(errorMessage(response.status, body.message, path), response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
