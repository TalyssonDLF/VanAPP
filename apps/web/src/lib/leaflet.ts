type Marker = {
  addTo(map: LeafletMap): Marker;
  bindPopup(html: string): Marker;
  openPopup(): void;
  getLatLng(): unknown;
  setIcon(icon: unknown): Marker;
};
type LeafletMap = {
  remove(): void;
  invalidateSize(options?: object): void;
  fitBounds(points: [number, number][], options?: object): void;
  flyTo(point: [number, number], zoom: number): void;
  setView(point: [number, number], zoom: number): void;
};
type DivIcon = unknown;
type Leaflet = {
  map(element: HTMLElement): LeafletMap;
  tileLayer(url: string, options: object): { addTo(map: LeafletMap): void };
  marker(point: [number, number], options?: object): Marker;
  divIcon(options: object): DivIcon;
};
declare global {
  interface Window {
    L?: Leaflet;
  }
}

let loading: Promise<Leaflet> | undefined;
export function loadLeaflet(): Promise<Leaflet> {
  if (window.L) return Promise.resolve(window.L);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    css.integrity = "sha256-p4NxAoJBhIINfQ3ynWPdc0SS5ObMTB2QbVtY5uOFIsc=";
    css.crossOrigin = "";
    const cssReady = new Promise<void>((ready, fail) => {
      css.onload = () => ready();
      css.onerror = () =>
        fail(new Error("Não foi possível carregar o CSS do Leaflet"));
    });
    document.head.append(css);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.onload = () => {
      void cssReady
        .then(() =>
          window.L
            ? resolve(window.L)
            : reject(new Error("Leaflet indisponível")),
        )
        .catch(reject);
    };
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o Leaflet"));
    document.head.append(script);
  });
  return loading;
}
export type { DivIcon, LeafletMap, Marker };
