import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/resource-layout";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  studentsApi,
  type MapSchool,
  type MapVehicle,
  type StudentMapItem,
  type StudentMapResponse,
} from "@/lib/api/resources";
import {
  loadLeaflet,
  type DivIcon,
  type LeafletMap,
  type Marker,
} from "@/lib/leaflet";
import { toast } from "sonner";
export const toValidCoordinate = (
  value: unknown,
  limit: 90 | 180,
): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit
    ? coordinate
    : null;
};
const coordinates = (
  latitude: unknown,
  longitude: unknown,
): [number, number] | null => {
  const lat = toValidCoordinate(latitude, 90);
  const lng = toValidCoordinate(longitude, 180);
  return lat === null || lng === null ? null : [lat, lng];
};
export const isStudentLocated = (s: StudentMapItem) =>
  coordinates(s.addressDetails?.latitude, s.addressDetails?.longitude) !== null;
export const locationReason = (s: StudentMapItem) =>
  !s.addressDetails
    ? "Sem endereço"
    : s.addressDetails.geocodingStatus === "FAILED"
      ? s.addressDetails.geocodingError || "Endereço não localizado"
      : s.addressDetails.geocodingStatus === "PENDING"
        ? "Aguardando geocoding"
        : "Coordenadas inválidas";
const valid = (a?: unknown, b?: unknown) => coordinates(a, b) !== null;
const esc = (v: string) =>
  v.replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ]!,
  );
export function StudentMapPage() {
  const [data, setData] = useState<StudentMapResponse>(),
    [vehicleId, setVehicle] = useState(""),
    [schoolId, setSchool] = useState(""),
    [layers, setLayers] = useState({
      students: true,
      schools: true,
      vehicles: true,
    });
  const load = useCallback(async (id?: string) => {
    try {
      const r = await studentsApi.map(id);
      setData(r);
      setVehicle(r.selectedVehicle?.id ?? "");
    } catch {
      toast.error("Não foi possível carregar o mapa.");
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const students = useMemo(
      () =>
        data?.students.filter((s) => !schoolId || s.schoolId === schoolId) ??
        [],
      [data, schoolId],
    ),
    schools = useMemo(
      () => data?.schools.filter((s) => !schoolId || s.id === schoolId) ?? [],
      [data, schoolId],
    );
  if (!data)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <RefreshCw className="animate-spin" /> Carregando mapa...
      </div>
    );
  const missingStudents = students.filter((s) => !isStudentLocated(s)),
    missingSchools = schools.filter((s) => !valid(s.latitude, s.longitude));
  return (
    <div className="student-map-page">
      <div className="student-map-header">
        <PageHeader
          title="Mapa de Alunos"
          description="Residências, escolas e pontos iniciais das vans."
        />
      </div>
      <div className="student-map-workspace">
        <aside className="student-map-sidebar space-y-4 p-4">
          <Field label="Van">
            <Select
              value={vehicleId}
              onChange={(e) => void load(e.target.value)}
            >
              <option value="">Sem van selecionada</option>
              {data.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} · {v.plate}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Escola">
            <Select
              value={schoolId}
              onChange={(e) => setSchool(e.target.value)}
            >
              <option value="">Todas as escolas</option>
              {data.schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex gap-4 text-sm">
            {Object.entries({
              students: "Alunos",
              schools: "Escolas",
              vehicles: "Vans",
            }).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={layers[key as keyof typeof layers]}
                  onChange={(e) =>
                    setLayers({ ...layers, [key]: e.target.checked })
                  }
                />{" "}
                {label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Summary n={students.length} t="alunos" />
            <Summary n={schools.length} t="escolas" />
            <Summary n={data.selectedVehicle ? 1 : 0} t="van" />
          </div>
          {(!data.selectedVehicle ||
            !valid(
              data.selectedVehicle.startLatitude,
              data.selectedVehicle.startLongitude,
            )) && (
            <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm">
              Esta van ainda não possui um ponto inicial configurado.
              {data.selectedVehicle && (
                <Link
                  className="mt-2 block underline"
                  to={`/veiculos/${data.selectedVehicle.id}/editar`}
                >
                  Configurar van
                </Link>
              )}
            </div>
          )}{" "}
          {(missingStudents.length > 0 || missingSchools.length > 0) && (
            <div className="rounded bg-amber-50 p-3 text-sm">
              <strong>Pendências de localização</strong>
              <p>{missingStudents.length} aluno(s) sem localização</p>
              <p>{missingSchools.length} escola(s) sem endereço/localização</p>
            </div>
          )}
          <div>
            <strong className="text-sm">Legenda</strong>
            <p>🚐 Ponto inicial da van</p>
            <p>👤 Aluno</p>
            <p>🏫 Escola</p>
            <h3 className="mt-3 text-xs font-semibold uppercase">Escolas</h3>
            {schools.map((s) => (
              <p className="flex items-center gap-2 text-sm" key={s.id}>
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: s.mapColor }}
                />
                {s.name}
              </p>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              const r = await studentsApi.geocode();
              toast.success(`${r.processed} endereço(s) processado(s).`);
              void load(vehicleId);
            }}
          >
            Atualizar localizações
          </Button>
        </aside>
        <main className="student-map-content">
          <Map
            students={layers.students ? students : []}
            schools={layers.schools ? schools : []}
            vehicle={layers.vehicles ? data.selectedVehicle : null}
          />
        </main>
      </div>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1 text-xs font-medium text-neutral-600">
      {label}
      {children}
    </label>
  );
}
function Summary({ n, t }: { n: number; t: string }) {
  return (
    <div className="rounded border p-2">
      <strong className="block">{n}</strong>
      <small>{t}</small>
    </div>
  );
}
const STUDENT_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M5 21c.5-5 2.8-7 7-7s6.5 2 7 7z"/></svg>';
const SCHOOL_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-6 9 6v10H3z"/><path class="marker-cutout" d="M7 11h3v3H7zm7 0h3v3h-3zm-4 5h4v4h-4z"/></svg>';
const VEHICLE_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h13c2 0 3 1 4 4l1 4v4h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H2V8a2 2 0 0 1 1-2z"/><path class="marker-cutout" d="M5 8h5v4H5zm7 0h4c1 0 1.5 1 2 4h-6z"/></svg>';
function createIcon(
  L: Awaited<ReturnType<typeof loadLeaflet>>,
  color: string,
  kind: "student" | "school" | "vehicle",
  svg: string,
  size: number,
): DivIcon {
  const safeColor = /^#[0-9a-f]{3,8}$/i.test(color) ? color : "#475569";
  return L.divIcon({
    className: `map-custom-marker map-${kind}-icon`,
    html: `<span class="student-map-marker student-map-marker--${kind}" style="--marker-color:${safeColor}">${svg}</span>`,
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 8],
    popupAnchor: [0, -size - 4],
  });
}
export const createStudentIcon = (
  L: Awaited<ReturnType<typeof loadLeaflet>>,
  color: string,
): DivIcon => createIcon(L, color, "student", STUDENT_SVG, 36);
export const createSchoolIcon = (
  L: Awaited<ReturnType<typeof loadLeaflet>>,
  color: string,
): DivIcon => createIcon(L, color, "school", SCHOOL_SVG, 44);
export const createVehicleIcon = (
  L: Awaited<ReturnType<typeof loadLeaflet>>,
): DivIcon => createIcon(L, "#f59e0b", "vehicle", VEHICLE_SVG, 46);
function Map({
  students,
  schools,
  vehicle,
}: {
  students: StudentMapItem[];
  schools: MapSchool[];
  vehicle: MapVehicle | null;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null),
    mapElementRef = useRef<HTMLDivElement>(null),
    map = useRef<LeafletMap | null>(null),
    markers = useRef<Marker[]>([]);
  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | undefined;
    void loadLeaflet()
      .then((L) => {
        if (!active || !mapElementRef.current || !wrapperRef.current) return;
        const m = L.map(mapElementRef.current);
        map.current = m;
        observer = new ResizeObserver(() => {
          window.requestAnimationFrame(() => m.invalidateSize({ pan: false }));
        });
        observer.observe(wrapperRef.current);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(m);
        const points: [number, number][] = [];
        markers.current = [];
        const vehiclePoint = vehicle
          ? coordinates(vehicle.startLatitude, vehicle.startLongitude)
          : null;
        let vehicleMarkersCreated = 0;
        let schoolMarkersCreated = 0;
        let studentMarkersCreated = 0;
        if (vehicle && vehiclePoint) {
          const p = vehiclePoint;
          points.push(p);
          markers.current.push(
            L.marker(p, { icon: createVehicleIcon(L) })
              .addTo(m)
              .bindPopup(
                `<strong>🚐 ${esc(`${vehicle.brand} ${vehicle.model}`)}</strong><br>Ponto inicial<br>${esc([vehicle.startStreet, vehicle.startNumber].filter(Boolean).join(", "))}${vehicle.startNeighborhood ? `<br>${esc(vehicle.startNeighborhood)}` : ""}${vehicle.defaultDriver ? `<br>Motorista: ${esc(vehicle.defaultDriver.name)}` : ""}`,
              ),
          );
          vehicleMarkersCreated += 1;
        }
        schools
          .filter((s) => valid(s.latitude, s.longitude))
          .forEach((s) => {
            const p = coordinates(s.latitude, s.longitude)!;
            points.push(p);
            markers.current.push(
              L.marker(p, { icon: createSchoolIcon(L, s.mapColor) })
                .addTo(m)
                .bindPopup(
                  `<strong>🏫 ${esc(s.name)}</strong><br>${esc([s.street, s.number].filter(Boolean).join(", "))}<br>${esc(s.neighborhood ?? "")}<br>${s.studentCount} alunos vinculados<br><a href="/escolas/${encodeURIComponent(s.id)}">Ver escola</a>`,
                ),
            );
            schoolMarkersCreated += 1;
          });
        students.filter(isStudentLocated).forEach((s) => {
          const p = coordinates(
              s.addressDetails?.latitude,
              s.addressDetails?.longitude,
            )!,
            color = s.school?.mapColor ?? "#475569";
          points.push(p);
          markers.current.push(
            L.marker(p, { icon: createStudentIcon(L, color) })
              .addTo(m)
              .bindPopup(
                `<strong>👤 ${esc(s.name)}</strong><br>${esc(s.address ?? "")}<br>${esc(s.addressDetails?.neighborhood ?? "")}${s.school ? `<br>🏫 ${esc(s.school.name)}` : ""}<br><a href="/alunos/${encodeURIComponent(s.id)}">Ver aluno</a>`,
              ),
          );
          studentMarkersCreated += 1;
        });
        if (import.meta.env.DEV) {
          console.debug("[StudentMap diagnostics]", {
            studentsReceived: students.length,
            studentsWithCoordinates: studentMarkersCreated,
            studentMarkersCreated,
            schoolsReceived: schools.length,
            schoolsWithCoordinates: schoolMarkersCreated,
            schoolMarkersCreated,
            vehicleWithCoordinates: vehiclePoint !== null,
            vehicleMarkersCreated,
          });
        }
        if (points.length > 1)
          m.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
        else if (points.length === 1) m.setView(points[0], 16);
        else m.setView([-14.2, -51.9], 4);
      })
      .catch(() => toast.error("Não foi possível carregar o Leaflet."));
    return () => {
      active = false;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
    };
  }, [students, schools, vehicle]);
  return (
    <div ref={wrapperRef} className="student-map-canvas">
      {!students.some(isStudentLocated) &&
        !schools.some((s) => valid(s.latitude, s.longitude)) &&
        !valid(vehicle?.startLatitude, vehicle?.startLongitude) && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-neutral-50">
            <p>
              <MapPin className="mx-auto" />
              Nenhuma localização disponível.
            </p>
          </div>
        )}
      <div
        ref={mapElementRef}
        className="absolute inset-0"
        aria-label="Mapa de alunos, escolas e vans"
      />
    </div>
  );
}
