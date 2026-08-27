import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPin, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/resource-layout";
import {
  studentsApi,
  type StudentMapItem,
  type StudentMapResponse,
} from "@/lib/api/resources";
import { loadLeaflet, type LeafletMap, type Marker } from "@/lib/leaflet";

export const isStudentLocated = (student: StudentMapItem) =>
  Number.isFinite(student.addressDetails?.latitude) &&
  Number.isFinite(student.addressDetails?.longitude) &&
  Math.abs(student.addressDetails!.latitude!) <= 90 &&
  Math.abs(student.addressDetails!.longitude!) <= 180;
const escape = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ]!,
  );
export const locationReason = (student: StudentMapItem) =>
  !student.addressDetails
    ? "Sem endereço"
    : student.addressDetails.geocodingStatus === "FAILED"
      ? student.addressDetails.geocodingError || "Endereço não localizado"
      : student.addressDetails.geocodingStatus === "PENDING"
        ? "Aguardando geocoding"
        : "Coordenadas inválidas";

export function StudentMapPage() {
  const [data, setData] = useState<StudentMapResponse>();
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [showMissing, setShowMissing] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const load = useCallback(async (id?: string) => {
    setError(false);
    try {
      const result = await studentsApi.map(id);
      setData(result);
      setVehicleId(result.selectedVehicle?.id ?? "");
    } catch {
      setError(true);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const filtered = useMemo(
    () =>
      data?.students.filter(
        (student) =>
          (!status || student.status === status) &&
          student.name
            .toLocaleLowerCase("pt-BR")
            .includes(search.toLocaleLowerCase("pt-BR")),
      ) ?? [],
    [data, search, status],
  );
  const located = useMemo(() => filtered.filter(isStudentLocated), [filtered]);
  const missing = useMemo(
    () => filtered.filter((student) => !isStudentLocated(student)),
    [filtered],
  );
  async function processAddresses() {
    setGeocoding(true);
    try {
      const result = await studentsApi.geocode();
      toast.success(`${result.processed} endereço(s) processado(s).`);
      await load(vehicleId);
    } catch {
      toast.error("Não foi possível atualizar as localizações.");
    } finally {
      setGeocoding(false);
    }
  }
  if (!data && !error)
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-neutral-500">
        <RefreshCw className="mr-2 animate-spin" size={18} />
        Carregando mapa e alunos...
      </div>
    );
  if (error)
    return (
      <div className="py-16 text-center">
        <p className="font-medium">Não foi possível carregar o mapa.</p>
        <Button className="mt-4" variant="outline" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </div>
    );
  return (
    <>
      <PageHeader
        title="Mapa de Alunos"
        description="Visualize os pontos de embarque dos alunos cadastrados."
      />
      <div className="mt-5 grid min-h-[calc(100vh-10.5rem)] overflow-hidden rounded-lg border bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="max-h-[45vh] overflow-y-auto border-b p-4 lg:max-h-none lg:border-b-0 lg:border-r">
          <label className="text-xs font-medium text-neutral-600">Van</label>
          <Select
            className="mt-1"
            value={vehicleId}
            onChange={(event) => void load(event.target.value)}
          >
            <option value="">Sem van selecionada</option>
            {data!.vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.brand} {vehicle.model} · {vehicle.plate}
              </option>
            ))}
          </Select>
          {data!.selectedVehicle && (
            <div className="mt-3 rounded-md bg-neutral-50 p-3 text-sm">
              <strong>
                {data!.selectedVehicle.brand} {data!.selectedVehicle.model}
              </strong>
              <p className="text-neutral-500">
                {data!.selectedVehicle.defaultDriver?.name ??
                  "Sem motorista padrão"}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {data!.selectedVehicle.baseAddress ??
                  "Ponto inicial não definido"}
              </p>
            </div>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Summary value={filtered.length} label="Alunos" />
            <Summary value={located.length} label="No mapa" />
            <Summary value={missing.length} label="Sem local" />
          </div>
          <div className="relative mt-5">
            <Search
              className="absolute left-3 top-2.5 text-neutral-400"
              size={16}
            />
            <Input
              className="pl-9"
              placeholder="Buscar aluno..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            className="mt-2"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
          </Select>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Alunos</h2>
            {missing.length > 0 && (
              <button
                className="text-xs text-amber-700 hover:underline"
                onClick={() => setShowMissing((value) => !value)}
              >
                {showMissing ? "Ocultar" : "Ver"} sem localização
              </button>
            )}
          </div>
          {showMissing && (
            <div className="mt-2 rounded border border-amber-200 bg-amber-50 p-2">
              {missing.map((student) => (
                <div
                  className="border-b py-2 text-xs last:border-0"
                  key={student.id}
                >
                  <strong>{student.name}</strong>
                  <p className="text-amber-800">{locationReason(student)}</p>
                </div>
              ))}
            </div>
          )}
          <StudentList students={located} />
          <Button
            className="mt-3 w-full"
            variant="outline"
            disabled={geocoding}
            onClick={() => void processAddresses()}
          >
            <RefreshCw size={15} className={geocoding ? "animate-spin" : ""} />
            Atualizar localizações
          </Button>
        </aside>
        <StudentLeafletMap students={located} vehicle={data!.selectedVehicle} />
      </div>
    </>
  );
}
function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded border p-2">
      <strong className="block text-lg">{value}</strong>
      <span className="text-[11px] text-neutral-500">{label}</span>
    </div>
  );
}
function StudentList({ students }: { students: StudentMapItem[] }) {
  return (
    <div className="mt-2 max-h-64 divide-y overflow-auto">
      {students.map((student) => (
        <button
          className="flex w-full items-center gap-2 py-2 text-left text-sm hover:bg-neutral-50"
          key={student.id}
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent("student-map-focus", { detail: student.id }),
            )
          }
        >
          <Badge className="min-w-7 justify-center bg-blue-50 text-blue-700">
            {student.order}
          </Badge>
          <span className="truncate">{student.name}</span>
        </button>
      ))}
    </div>
  );
}
function StudentLeafletMap({
  students,
  vehicle,
}: {
  students: StudentMapItem[];
  vehicle: StudentMapResponse["selectedVehicle"];
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  useEffect(() => {
    let active = true,
      instance: LeafletMap | undefined;
    void loadLeaflet()
      .then((L) => {
        if (!active || !container.current) return;
        const created = L.map(container.current);
        instance = created;
        map.current = created;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(created);
        const points: [number, number][] = [];
        markers.current.clear();
        if (
          vehicle &&
          Number.isFinite(vehicle.baseLatitude) &&
          Number.isFinite(vehicle.baseLongitude)
        ) {
          const point: [number, number] = [
            vehicle.baseLatitude!,
            vehicle.baseLongitude!,
          ];
          points.push(point);
          const icon = L.divIcon({
            className: "map-van-marker",
            html: "🚐",
            iconSize: [42, 42],
            iconAnchor: [21, 21],
          });
          L.marker(point, { icon })
            .addTo(created)
            .bindPopup(
              `<strong>Ponto inicial</strong><br>${escape(`${vehicle.brand} ${vehicle.model}`)}<br>${vehicle.defaultDriver ? `Motorista: ${escape(vehicle.defaultDriver.name)}<br>` : ""}${escape(vehicle.baseAddress ?? "")}`,
            );
        }
        students.forEach((student) => {
          const point: [number, number] = [
            student.addressDetails!.latitude!,
            student.addressDetails!.longitude!,
          ];
          points.push(point);
          const icon = L.divIcon({
            className: "map-student-marker",
            html: String(student.order),
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });
          const marker = L.marker(point, { icon })
            .addTo(created)
            .bindPopup(
              `<strong>${escape(student.name)}</strong><br>${escape(student.address ?? "")}<br>${escape(student.addressDetails?.neighborhood ?? "")}<br><a href="/alunos/${encodeURIComponent(student.id)}">Ver aluno</a>`,
            );
          markers.current.set(student.id, marker);
        });
        if (points.length)
          created.fitBounds(points, { padding: [36, 36], maxZoom: 16 });
      })
      .catch(() => toast.error("Não foi possível carregar o Leaflet."));
    return () => {
      active = false;
      instance?.remove();
      map.current = null;
    };
  }, [students, vehicle]);
  useEffect(() => {
    const focus = (event: Event) => {
      const id = (event as CustomEvent<string>).detail,
        marker = markers.current.get(id);
      if (marker && map.current) {
        map.current.flyTo(marker.getLatLng() as [number, number], 17);
        marker.openPopup();
      }
    };
    window.addEventListener("student-map-focus", focus);
    return () => window.removeEventListener("student-map-focus", focus);
  }, []);
  if (!students.length && !vehicle?.baseLatitude)
    return (
      <div className="flex min-h-[480px] flex-col items-center justify-center bg-neutral-50 p-8 text-center">
        <MapPin className="mb-3 text-neutral-400" />
        <p className="font-medium">
          Nenhum aluno possui localização disponível para exibição no mapa.
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          Cadastre endereços completos e atualize as localizações.
        </p>
      </div>
    );
  return (
    <div className="relative min-h-[480px]">
      <div
        ref={container}
        className="absolute inset-0"
        aria-label="Mapa com pontos dos alunos"
      />
      <button
        className="absolute bottom-6 right-3 z-[500] rounded bg-white p-2 shadow"
        title="Ajustar mapa"
        onClick={() => {
          const points = [...markers.current.values()].map(
            (marker) => marker.getLatLng() as [number, number],
          );
          if (points.length)
            map.current?.fitBounds(points, { padding: [30, 30] });
        }}
      >
        <LocateFixed size={18} />
      </button>
    </div>
  );
}
