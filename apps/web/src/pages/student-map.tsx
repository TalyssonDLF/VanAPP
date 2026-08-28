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
import { loadLeaflet, type LeafletMap, type Marker } from "@/lib/leaflet";
import { toast } from "sonner";
export const isStudentLocated = (s: StudentMapItem) =>
  valid(s.addressDetails?.latitude, s.addressDetails?.longitude);
export const locationReason = (s: StudentMapItem) =>
  !s.addressDetails
    ? "Sem endereço"
    : s.addressDetails.geocodingStatus === "FAILED"
      ? s.addressDetails.geocodingError || "Endereço não localizado"
      : s.addressDetails.geocodingStatus === "PENDING"
        ? "Aguardando geocoding"
        : "Coordenadas inválidas";
const valid = (a?: number | null, b?: number | null) =>
  Number.isFinite(a) &&
  Number.isFinite(b) &&
  Math.abs(a!) <= 90 &&
  Math.abs(b!) <= 180;
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
    <>
      <PageHeader
        title="Mapa de Alunos"
        description="Residências, escolas e pontos iniciais das vans."
      />
      <div className="mt-5 grid overflow-hidden rounded-lg border bg-white lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4 border-r p-4">
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
        <Map
          students={layers.students ? students : []}
          schools={layers.schools ? schools : []}
          vehicle={layers.vehicles ? data.selectedVehicle : null}
        />
      </div>
    </>
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
function icon(
  L: Awaited<ReturnType<typeof loadLeaflet>>,
  symbol: string,
  color: string,
  kind: string,
) {
  return L.divIcon({
    className: "map-custom-marker",
    html: `<span class="map-symbol map-${kind}" style="background:${color}">${symbol}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}
function Map({
  students,
  schools,
  vehicle,
}: {
  students: StudentMapItem[];
  schools: MapSchool[];
  vehicle: MapVehicle | null;
}) {
  const ref = useRef<HTMLDivElement>(null),
    map = useRef<LeafletMap | null>(null),
    markers = useRef<Marker[]>([]);
  useEffect(() => {
    let active = true;
    void loadLeaflet()
      .then((L) => {
        if (!active || !ref.current) return;
        const m = L.map(ref.current);
        map.current = m;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        }).addTo(m);
        const points: [number, number][] = [];
        markers.current = [];
        if (vehicle && valid(vehicle.startLatitude, vehicle.startLongitude)) {
          const p: [number, number] = [
            vehicle.startLatitude!,
            vehicle.startLongitude!,
          ];
          points.push(p);
          markers.current.push(
            L.marker(p, { icon: icon(L, "🚐", "#111827", "van") })
              .addTo(m)
              .bindPopup(
                `<strong>🚐 ${esc(`${vehicle.brand} ${vehicle.model}`)}</strong><br>Ponto inicial<br>${esc([vehicle.startStreet, vehicle.startNumber].filter(Boolean).join(", "))}${vehicle.startNeighborhood ? `<br>${esc(vehicle.startNeighborhood)}` : ""}${vehicle.defaultDriver ? `<br>Motorista: ${esc(vehicle.defaultDriver.name)}` : ""}`,
              ),
          );
        }
        schools
          .filter((s) => valid(s.latitude, s.longitude))
          .forEach((s) => {
            const p: [number, number] = [s.latitude!, s.longitude!];
            points.push(p);
            markers.current.push(
              L.marker(p, { icon: icon(L, "🏫", s.mapColor, "school") })
                .addTo(m)
                .bindPopup(
                  `<strong>🏫 ${esc(s.name)}</strong><br>${esc([s.street, s.number].filter(Boolean).join(", "))}<br>${esc(s.neighborhood ?? "")}<br>${s.studentCount} alunos vinculados<br><a href="/escolas/${encodeURIComponent(s.id)}">Ver escola</a>`,
                ),
            );
          });
        students.filter(isStudentLocated).forEach((s) => {
          const p: [number, number] = [
              s.addressDetails!.latitude!,
              s.addressDetails!.longitude!,
            ],
            color = s.school?.mapColor ?? "#475569";
          points.push(p);
          markers.current.push(
            L.marker(p, { icon: icon(L, "👤", color, "student") })
              .addTo(m)
              .bindPopup(
                `<strong>👤 ${esc(s.name)}</strong><br>${esc(s.address ?? "")}<br>${esc(s.addressDetails?.neighborhood ?? "")}${s.school ? `<br>🏫 ${esc(s.school.name)}` : ""}<br><a href="/alunos/${encodeURIComponent(s.id)}">Ver aluno</a>`,
              ),
          );
        });
        if (points.length)
          m.fitBounds(points, { padding: [35, 35], maxZoom: 16 });
        else m.setView([-14.2, -51.9], 4);
      })
      .catch(() => toast.error("Não foi possível carregar o Leaflet."));
    return () => {
      active = false;
      map.current?.remove();
      map.current = null;
    };
  }, [students, schools, vehicle]);
  return (
    <div className="relative min-h-[620px]">
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
        ref={ref}
        className="absolute inset-0"
        aria-label="Mapa de alunos, escolas e vans"
      />
    </div>
  );
}
