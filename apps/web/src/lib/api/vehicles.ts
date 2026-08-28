import { api } from "./client";
export type VehicleType = "VAN" | "MINIBUS" | "BUS" | "OTHER";
export type VehicleStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE";
export type VehicleDocumentType =
  "REGISTRATION" | "INSURANCE" | "INSPECTION" | "AUTHORIZATION" | "OTHER";
export type DocumentStatus =
  "VALID" | "EXPIRING_SOON" | "EXPIRED" | "NO_EXPIRY";
export interface VehicleDocument {
  id: string;
  type: VehicleDocumentType;
  identifier?: string;
  issuedAt?: string;
  expiresAt?: string;
  notes?: string;
  documentStatus: DocumentStatus;
}
export interface Vehicle {
  id: string;
  plate: string;
  renavam?: string;
  brand: string;
  model: string;
  manufactureYear?: number;
  modelYear?: number;
  color?: string;
  passengerCapacity: number;
  type: VehicleType;
  status: VehicleStatus;
  currentMileage?: number;
  defaultDriverId?: string;
  defaultDriver?: { id: string; name: string; status: "ACTIVE" | "INACTIVE" };
  notes?: string;
  startAddress?: {
    postalCode?: string;
    street: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
  };
  startPostalCode?: string;
  startStreet?: string;
  startNumber?: string;
  startComplement?: string;
  startNeighborhood?: string;
  startCity?: string;
  startState?: string;
  startLatitude?: number;
  startLongitude?: number;
  documents: VehicleDocument[];
  documentSummary?: { expired: number; expiringSoon: number };
  createdAt: string;
  updatedAt: string;
}
export type VehicleInput = Omit<
  Vehicle,
  | "id"
  | "defaultDriver"
  | "documents"
  | "documentSummary"
  | "createdAt"
  | "updatedAt"
>;
export type DocumentInput = Pick<
  VehicleDocument,
  "type" | "identifier" | "issuedAt" | "expiresAt" | "notes"
>;
interface Page<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
const qs = (v: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(v).forEach(
    ([k, x]) => x !== undefined && x !== "" && p.set(k, String(x)),
  );
  return p;
};
export const vehiclesApi = {
  list: (p: Record<string, string | number | undefined>) =>
    api<Page<Vehicle>>(`/vehicles?${qs(p)}`),
  one: (id: string) => api<Vehicle>(`/vehicles/${id}`),
  create: (d: VehicleInput) =>
    api<Vehicle>("/vehicles", { method: "POST", body: JSON.stringify(d) }),
  update: (id: string, d: Partial<VehicleInput>) =>
    api<Vehicle>(`/vehicles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(d),
    }),
  remove: (id: string) => api(`/vehicles/${id}`, { method: "DELETE" }),
  addDocument: (id: string, d: DocumentInput) =>
    api<VehicleDocument>(`/vehicles/${id}/documents`, {
      method: "POST",
      body: JSON.stringify(d),
    }),
  updateDocument: (v: string, id: string, d: DocumentInput) =>
    api<VehicleDocument>(`/vehicles/${v}/documents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(d),
    }),
  removeDocument: (v: string, id: string) =>
    api(`/vehicles/${v}/documents/${id}`, { method: "DELETE" }),
};
