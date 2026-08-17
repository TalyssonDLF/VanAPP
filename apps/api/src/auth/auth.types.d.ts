export interface SafeUser {
    id: string;
    name: string;
    email: string;
}
export interface SessionPayload {
    sub: string;
    version: number;
}
