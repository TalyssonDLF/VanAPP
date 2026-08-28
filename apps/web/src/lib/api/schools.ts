import { api } from "./client";
export interface School {
  id: string;
  name: string;
  mapColor: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  studentCount?: number;
}
export type SchoolInput = Omit<
  School,
  "id" | "latitude" | "longitude" | "studentCount"
>;
const qs = (v: Record<string, string | number>) =>
  new URLSearchParams(Object.entries(v).map(([k, x]) => [k, String(x)]));
export const schoolsApi = {
  list: (p: Record<string, string | number>) =>
    api<{
      data: School[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
    }>(`/schools?${qs(p)}`),
  one: (id: string) => api<School>(`/schools/${id}`),
  create: (d: SchoolInput) =>
    api<School>("/schools", { method: "POST", body: JSON.stringify(d) }),
  update: (id: string, d: Partial<SchoolInput>) =>
    api<School>(`/schools/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
  remove: (id: string) => api(`/schools/${id}`, { method: "DELETE" }),
};
