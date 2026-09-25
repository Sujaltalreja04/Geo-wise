"use client";

import * as React from "react";
import {
  Layers,
  Map as MapIcon,
  MousePointer,
  Pencil,
  Ruler,
  Hand,
  Printer,
  Search,
  X,
  Crosshair,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Bookmark,
  Info,
} from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import {
  ALL_FEATURES,
  DISTRICTS,
  POIS,
  RIYADH_BBOX,
  RIYADH_CENTER,
  SAMPLE_AOI,
  type GeoFeature,
} from "@/lib/saudi-geo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

// ─── Projection helpers ────────────────────────────────────────────
// Simple equirectangular projection bounded to Riyadh for the SVG viewport.

const PADDING = 0.04; // degrees around the bbox

const VIEW_BBOX = {
  minLon: RIYADH_BBOX.minLon - PADDING,
  minLat: RIYADH_BBOX.minLat - PADDING,
  maxLon: RIYADH_BBOX.maxLon + PADDING,
  maxLat: RIYADH_BBOX.maxLat + PADDING,
};

function project(lon: number, lat: number, w: number, h: number) {
  const x =
    ((lon - VIEW_BBOX.minLon) / (VIEW_BBOX.maxLon - VIEW_BBOX.minLon)) * w;
  const y =
    h - ((lat - VIEW_BBOX.minLat) / (VIEW_BBOX.maxLat - VIEW_BBOX.minLat)) * h;
  return { x, y };
}

function ringToPath(ring: number[][], w: number, h: number): string {
  return ring
    .map((pt, i) => {
      const p = project(pt[0], pt[1], w, h);
      return `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

// Haversine distance in metres
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function polygonArea(ring: number[][]): number {
  // Spherical excess approximation (m²) — good enough for display.
  let area = 0;
  const R = 6371000;
  const n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    const [lon1, lat1] = ring[i].map((d) => (d * Math.PI) / 180);
    const [lon2, lat2] = ring[(i + 1) % n].map((d) => (d * Math.PI) / 180);
    area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((area * R * R) / 2);
}

// ─── Tool state ────────────────────────────────────────────────────

type Tool = "pan" | "select" | "measure" | "draw";

interface LayerState {
  districts: boolean;
  pois: boolean;
  aoi: boolean;
  grid: boolean;
  labels: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────

function LegendDot({ color }: { color: string }) {
  return <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />;
}

const POI_COLORS: Record<string, string> = {
  park: "#16a34a",
  government: "#9333ea",
  education: "#0ea5e9",
  commercial: "#f59e0b",
  infrastructure: "#64748b",
  industrial: "#78716c",
  residential: "#14b8a6",
  heritage: "#b45309",
};

// ─── Main component ────────────────────────────────────────────────

export function MapWorkspace() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const selectedFeatureId = useGeoWiseStore((s) => s.selectedFeatureId);
  const setSelectedFeatureId = useGeoWiseStore((s) => s.setSelectedFeatureId);

  const [tool, setTool] = React.useState<Tool>("select");
  const [layers, setLayers] = React.useState<LayerState>({
    districts: true,
    pois: true,
    aoi: true,
    grid: true,
    labels: true,
  });
  const [basemap, setBasemap] = React.useState<"light" | "dark" | "topo">("light");
  const [hover, setHover] = React.useState<{ feature: GeoFeature; x: number; y: number } | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [measurePoints, setMeasurePoints] = React.useState<[number, number][]>([]);
  const [drawPoints, setDrawPoints] = React.useState<[number, number][]>([]);
  const [search, setSearch] = React.useState("");

  const svgRef = React.useRef<SVGSVGElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dims, setDims] = React.useState({ w: 800, h: 600 });

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const r = el.getBoundingClientRect();
    setDims({ w: r.width, h: r.height });
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;

  // Convert screen coords → lon/lat (inverse projection, ignoring pan/zoom for simplicity)
  const screenToLonLat = React.useCallback(
    (clientX: number, clientY: number): [number, number] => {
      const svg = svgRef.current;
      if (!svg) return [RIYADH_CENTER.lon, RIYADH_CENTER.lat];
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return [RIYADH_CENTER.lon, RIYADH_CENTER.lat];
      const local = pt.matrixTransform(ctm.inverse());
      const lon =
        (local.x / w) * (VIEW_BBOX.maxLon - VIEW_BBOX.minLon) + VIEW_BBOX.minLon;
      const lat =
        ((h - local.y) / h) * (VIEW_BBOX.maxLat - VIEW_BBOX.minLat) +
        VIEW_BBOX.minLat;
      return [lon, lat];
    },
    [w, h]
  );

  const handleMapClick = (e: React.MouseEvent) => {
    const [lon, lat] = screenToLonLat(e.clientX, e.clientY);

    if (tool === "measure") {
      setMeasurePoints((p) => [...p, [lon, lat]]);
      return;
    }
    if (tool === "draw") {
      setDrawPoints((p) => [...p, [lon, lat]]);
      return;
    }
    // select tool: hit-test
    const target = e.target as Element;
    const fid = target.getAttribute("data-fid");
    if (fid) {
      setSelectedFeatureId(fid);
    } else {
      setSelectedFeatureId(null);
    }
  };

  const selectedFeature = React.useMemo(
    () => ALL_FEATURES.find((f) => f.id === selectedFeatureId) ?? null,
    [selectedFeatureId]
  );

  const filteredDistricts = React.useMemo(() => {
    if (!search.trim()) return DISTRICTS;
    const q = search.toLowerCase();
    return DISTRICTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameAr.includes(search) ||
        d.id.includes(q)
    );
  }, [search]);

  const filteredPois = React.useMemo(() => {
    if (!search.trim()) return POIS;
    const q = search.toLowerCase();
    return POIS.filter(
      (p) => p.name.toLowerCase().includes(q) || p.nameAr.includes(search)
    );
  }, [search]);

  // measurement summary
  const measureDistance = React.useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < measurePoints.length; i++)
      total += haversine(measurePoints[i - 1], measurePoints[i]);
    return total;
  }, [measurePoints]);

  const drawArea = React.useMemo(() => {
    if (drawPoints.length < 3) return 0;
    return polygonArea([...drawPoints, drawPoints[0]]);
  }, [drawPoints]);

  const aoiPath = ringToPath(SAMPLE_AOI, w, h);
  const measurePath =
    measurePoints.length >= 2
      ? ringToPath(measurePoints, w, h).replace(" Z", "")
      : "";
  const drawPath =
    drawPoints.length >= 2
      ? ringToPath([...drawPoints, drawPoints.length > 2 ? drawPoints[0] : drawPoints[1]], w, h)
      : "";

  const basemapBg =
    basemap === "dark"
      ? "#0a1020"
      : basemap === "topo"
        ? "#f0ebe2"
        : "#f8fafc";

  const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: "pan", icon: Hand, label: t("map.pan") },
    { id: "select", icon: MousePointer, label: t("map.select") },
    { id: "measure", icon: Ruler, label: t("map.measure") },
    { id: "draw", icon: Pencil, label: t("map.draw") },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] lg:grid-rows-1 h-full min-h-0">
      {/* LEFT — Layers & tools */}
      <Card className="rounded-none border-e border-y-0 border-s-0 bg-card flex flex-col overflow-hidden min-h-0">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 text-sm font-semibold mb-2">
            <Layers className="size-4 text-primary" />
            {t("map.layers")}
          </div>
          <div className="relative">
            <Search className="absolute start-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("common.search") + "…"}
              className="w-full ps-7 pe-2 py-1.5 text-xs rounded-md bg-muted/50 border border-transparent focus-visible:border-border focus-visible:bg-background outline-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* Basemap */}
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                {t("map.basemap")}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(["light", "dark", "topo"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBasemap(b)}
                    className={cn(
                      "h-12 rounded-md text-[0.65rem] font-medium border-2 transition-all flex items-end justify-center pb-1",
                      basemap === b
                        ? "border-primary ring-1 ring-primary/40"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    style={{
                      background:
                        b === "dark"
                          ? "linear-gradient(135deg,#0a1020,#1e293b)"
                          : b === "topo"
                            ? "linear-gradient(135deg,#f0ebe2,#e7d8c4)"
                            : "linear-gradient(135deg,#f8fafc,#e2e8f0)",
                      color: b === "dark" ? "#e2e8f0" : "#0f172a",
                    }}
                  >
                    {b === "light" ? (lang === "ar" ? "فاتح" : "Light") : b === "dark" ? (lang === "ar" ? "داكن" : "Dark") : (lang === "ar" ? "طبوغرافي" : "Topo")}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Tools */}
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                {t("map.tools")}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {tools.map((tl) => {
                  const Icon = tl.icon;
                  return (
                    <button
                      key={tl.id}
                      onClick={() => {
                        setTool(tl.id);
                        if (tl.id !== "measure") setMeasurePoints([]);
                        if (tl.id !== "draw") setDrawPoints([]);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-2 rounded-md text-xs font-medium border transition-colors",
                        tool === tl.id
                          ? "bg-primary/15 text-primary border-primary/40"
                          : "bg-muted/40 hover:bg-muted border-transparent"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span className="truncate">{tl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Layers */}
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                {t("map.layers")}
              </div>
              <ul className="space-y-1">
                {(
                  [
                    ["districts", t("mod.catalog") + " · Districts", "#3b82f6"],
                    ["pois", t("mod.catalog") + " · POIs", "#0ea5e9"],
                    ["aoi", "AOI (sample)", "#14b8a6"],
                    ["grid", lang === "ar" ? "الشبكة" : "Grid", "#94a3b8"],
                    ["labels", lang === "ar" ? "التسميات" : "Labels", "#cbd5e1"],
                  ] as const
                ).map(([id, label, color]) => (
                  <li key={id}>
                    <label className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-muted/50 cursor-pointer">
                      <button
                        onClick={() => setLayers((l) => ({ ...l, [id]: !l[id] }))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {layers[id] ? (
                          <Eye className="size-3.5" />
                        ) : (
                          <EyeOff className="size-3.5" />
                        )}
                      </button>
                      <LegendDot color={color} />
                      <span className="text-xs flex-1 truncate">{label}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Bookmarks */}
            <div>
              <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1">
                <Bookmark className="size-3" />
                {t("map.bookmarks")}
              </div>
              <ul className="space-y-1 text-xs">
                {[
                  { name: lang === "ar" ? "وسط الرياض" : "Riyadh Center", lon: 46.6753, lat: 24.7136 },
                  { name: lang === "ar" ? "حي الملقا" : "Al Malqa", lon: 46.645, lat: 24.805 },
                  { name: lang === "ar" ? "منطقة الدرعية" : "Darawiyah", lon: 46.585, lat: 24.775 },
                ].map((b) => (
                  <li key={b.name}>
                    <button
                      onClick={() => {
                        toast.success(`${t("map.bookmarks")}: ${b.name}`);
                      }}
                      className="w-full text-start px-2 py-1.5 rounded hover:bg-muted/60 truncate"
                    >
                      {b.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="border-t p-3 space-y-1.5">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("map.legend")}
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[0.65rem]">
            {Object.entries(POI_COLORS).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <LegendDot color={v} />
                <span className="capitalize text-muted-foreground">{k}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* CENTER — Map canvas */}
      <div
        ref={containerRef}
        className="relative bg-background overflow-hidden min-h-[420px] lg:min-h-0"
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          width={w}
          height={h}
          className="absolute inset-0"
          style={{ cursor: tool === "pan" ? "grab" : "crosshair" }}
          onClick={handleMapClick}
          onMouseLeave={() => setHover(null)}
        >
          {/* basemap background */}
          <rect x={0} y={0} width={w} height={h} fill={basemapBg} />

          {/* grid */}
          {layers.grid && (
            <g className="grid-layer" opacity={0.45}>
              {Array.from({ length: 11 }).map((_, i) => {
                const lon = VIEW_BBOX.minLon + (i * (VIEW_BBOX.maxLon - VIEW_BBOX.minLon)) / 10;
                const p1 = project(lon, VIEW_BBOX.minLat, w, h);
                const p2 = project(lon, VIEW_BBOX.maxLat, w, h);
                return (
                  <line key={`v${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={basemap === "dark" ? "#1e3a5f" : "#cbd5e1"} strokeWidth={0.5} />
                );
              })}
              {Array.from({ length: 11 }).map((_, i) => {
                const lat = VIEW_BBOX.minLat + (i * (VIEW_BBOX.maxLat - VIEW_BBOX.minLat)) / 10;
                const p1 = project(VIEW_BBOX.minLon, lat, w, h);
                const p2 = project(VIEW_BBOX.maxLon, lat, w, h);
                return (
                  <line key={`h${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={basemap === "dark" ? "#1e3a5f" : "#cbd5e1"} strokeWidth={0.5} />
                );
              })}
            </g>
          )}

          {/* AOI */}
          {layers.aoi && (
            <>
              <path d={aoiPath} fill="#14b8a6" fillOpacity={0.1} stroke="#14b8a6" strokeWidth={1.5} strokeDasharray="4 3" />
            </>
          )}

          {/* districts */}
          {layers.districts &&
            filteredDistricts.map((d) => {
              const isSel = selectedFeatureId === d.id;
              const ring = d.geometry.coordinates as number[][][];
              return (
                <g key={d.id}>
                  <path
                    d={ringToPath(ring[0], w, h)}
                    data-fid={d.id}
                    fill={isSel ? "#0ea5e9" : "#3b82f6"}
                    fillOpacity={isSel ? 0.55 : 0.25}
                    stroke={isSel ? "#0284c7" : "#1d4ed8"}
                    strokeWidth={isSel ? 2 : 1}
                    className="cursor-pointer transition-all hover:fill-opacity-70"
                    onMouseEnter={(e) =>
                      setHover({ feature: d, x: e.clientX, y: e.clientY })
                    }
                    onMouseMove={(e) =>
                      setHover({ feature: d, x: e.clientX, y: e.clientY })
                    }
                  />
                  {layers.labels && (
                    <text
                      x={
                        project(
                          ((d.geometry.coordinates as number[][][])[0][0][0] +
                            (d.geometry.coordinates as number[][][])[0][2][0]) /
                            2,
                          ((d.geometry.coordinates as number[][][])[0][0][1] +
                            (d.geometry.coordinates as number[][][])[0][2][1]) /
                            2,
                          w,
                          h
                        ).x
                      }
                      y={
                        project(
                          ((d.geometry.coordinates as number[][][])[0][0][0] +
                            (d.geometry.coordinates as number[][][])[0][2][0]) /
                            2,
                          ((d.geometry.coordinates as number[][][])[0][0][1] +
                            (d.geometry.coordinates as number[][][])[0][2][1]) /
                            2,
                          w,
                          h
                        ).y
                      }
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fontSize={9}
                      fontWeight={600}
                      fill={basemap === "dark" ? "#e2e8f0" : "#1e293b"}
                    >
                      {lang === "ar" ? d.nameAr : d.name}
                    </text>
                  )}
                </g>
              );
            })}

          {/* POIs */}
          {layers.pois &&
            filteredPois.map((p) => {
              const [lon, lat] = p.geometry.coordinates as number[];
              const pt = project(lon, lat, w, h);
              const isSel = selectedFeatureId === p.id;
              const color = POI_COLORS[p.subtype ?? ""] ?? "#64748b";
              return (
                <g key={p.id} className="cursor-pointer">
                  {p.properties.status === "monitoring" && (
                    <circle cx={pt.x} cy={pt.y} r={9} fill={color} opacity={0.25}>
                      <animate attributeName="r" values="6;11;6" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.05;0.4" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSel ? 6 : 4}
                    data-fid={p.id}
                    fill={color}
                    stroke={basemap === "dark" ? "#0a1020" : "#fff"}
                    strokeWidth={isSel ? 2 : 1}
                    className="transition-all"
                    onMouseEnter={(e) => setHover({ feature: p, x: e.clientX, y: e.clientY })}
                    onMouseMove={(e) => setHover({ feature: p, x: e.clientX, y: e.clientY })}
                  />
                </g>
              );
            })}

          {/* measurement line */}
          {measurePath && (
            <>
              <path d={measurePath} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="3 2" />
              {measurePoints.map((pt, i) => {
                const p = project(pt[0], pt[1], w, h);
                return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#f59e0b" stroke="#fff" strokeWidth={1} />;
              })}
            </>
          )}

          {/* drawing polygon */}
          {drawPath && (
            <>
              <path d={drawPath} fill="#14b8a6" fillOpacity={0.2} stroke="#14b8a6" strokeWidth={1.5} />
              {drawPoints.map((pt, i) => {
                const p = project(pt[0], pt[1], w, h);
                return <circle key={i} cx={p.x} cy={p.y} r={3} fill="#14b8a6" stroke="#fff" strokeWidth={1} />;
              })}
            </>
          )}

          {/* scale bar */}
          <g className="pointer-events-none">
            <line x1={16} y1={h - 22} x2={16 + (w * 0.1)} y2={h - 22} stroke={basemap === "dark" ? "#e2e8f0" : "#1e293b"} strokeWidth={2} />
            <text x={16 + (w * 0.05)} y={h - 28} textAnchor="middle" fontSize={9} fill={basemap === "dark" ? "#e2e8f0" : "#1e293b"}>
              {(haversine([VIEW_BBOX.minLon, VIEW_BBOX.minLat], [VIEW_BBOX.minLon + (VIEW_BBOX.maxLon - VIEW_BBOX.minLon) * 0.1, VIEW_BBOX.minLat]) / 1000).toFixed(1)} km
            </text>
          </g>
        </svg>

        {/* Hover tooltip */}
        {hover && (
          <div
            className="pointer-events-none fixed z-50 bg-popover text-popover-foreground text-xs rounded-md shadow-lg border px-2.5 py-1.5 max-w-[240px]"
            style={{ left: hover.x + 12, top: hover.y + 12 }}
          >
            <div className="font-semibold">
              {lang === "ar" ? hover.feature.nameAr : hover.feature.name}
            </div>
            <div className="text-muted-foreground text-[0.65rem] mt-0.5">
              {hover.feature.id} · {hover.feature.type}
              {hover.feature.subtype ? ` · ${hover.feature.subtype}` : ""}
            </div>
          </div>
        )}

        {/* Tool overlay — top right */}
        <div className="absolute top-3 end-3 flex items-center gap-1.5 bg-background/95 backdrop-blur border rounded-lg shadow-sm p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}>
                  <ZoomOut className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{lang === "ar" ? "تصغير" : "Zoom out"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="text-[0.7rem] text-muted-foreground px-1 tabular-nums">
            {(zoom * 100).toFixed(0)}%
          </span>
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setZoom((z) => Math.min(4, z + 0.2))}>
            <ZoomIn className="size-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => { setZoom(1); toast.success(lang === "ar" ? "تمت إعادة الضبط" : "View reset"); }}>
            <Maximize2 className="size-3.5" />
          </Button>
          <Separator orientation="vertical" className="h-5 mx-0.5" />
          <Button variant="ghost" size="icon" className="size-8" onClick={() => toast.success(lang === "ar" ? "تم إنشاء تخطيط طباعة" : "Print layout generated")}>
            <Printer className="size-3.5" />
          </Button>
        </div>

        {/* Tool mode banner */}
        {(tool === "measure" || tool === "draw") && (
          <div className="absolute top-3 start-3 bg-background/95 backdrop-blur border rounded-lg shadow-sm px-3 py-2 text-xs flex items-center gap-3 max-w-md">
            {tool === "measure" ? (
              <>
                <Ruler className="size-4 text-chart-4" />
                <span className="text-muted-foreground">{t("map.measure")}:</span>
                <Badge variant="secondary" className="tabular-nums">
                  {measurePoints.length > 1 ? `${(measureDistance / 1000).toFixed(2)} km` : "—"}
                </Badge>
                {measurePoints.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[0.7rem]"
                    onClick={() => setMeasurePoints([])}
                  >
                    <X className="size-3" />
                    {t("common.clear")}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Pencil className="size-4 text-primary" />
                <span className="text-muted-foreground">{t("map.draw")}:</span>
                <Badge variant="secondary" className="tabular-nums">
                  {drawPoints.length >= 3
                    ? `${(drawArea / 1_000_000).toFixed(3)} km²`
                    : `${drawPoints.length} pts`}
                </Badge>
                {drawPoints.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[0.7rem]"
                    onClick={() => setDrawPoints([])}
                  >
                    <X className="size-3" />
                    {t("common.clear")}
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {/* Crosshair coords */}
        <div className="absolute bottom-3 end-3 bg-background/95 backdrop-blur border rounded-md shadow-sm px-2.5 py-1 text-[0.65rem] text-muted-foreground font-mono tabular-nums">
          {RIYADH_CENTER.lon.toFixed(4)}° E · {RIYADH_CENTER.lat.toFixed(4)}° N
        </div>
      </div>

      {/* RIGHT — Feature inspector */}
      <Card className="rounded-none border-s border-y-0 border-e-0 bg-card flex flex-col overflow-hidden min-h-0">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Info className="size-4 text-primary" />
            {t("map.featureInfo")}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4">
            {!selectedFeature ? (
              <div className="text-center text-sm text-muted-foreground py-12 px-4">
                <Crosshair className="size-8 mx-auto mb-3 opacity-40" />
                <p>{t("map.noSelection")}</p>
              </div>
            ) : (
              <FeatureInspector feature={selectedFeature} />
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}

function FeatureInspector({ feature }: { feature: GeoFeature }) {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const setSelectedDatasetId = useGeoWiseStore((s) => s.setSelectedDatasetId);
  const setActiveModule = useGeoWiseStore((s) => s.setActiveModule);

  const coords =
    feature.geometry.type === "Point"
      ? (feature.geometry.coordinates as number[])
      : feature.geometry.type === "Polygon"
        ? (feature.geometry.coordinates as number[][][])[0][0]
        : [0, 0];

  return (
    <div className="space-y-4 text-sm">
      <div>
        <Badge variant="outline" className="mb-2 text-[0.65rem]">
          {feature.id}
        </Badge>
        <h3 className="font-semibold text-base">
          {lang === "ar" ? feature.nameAr : feature.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {feature.type}
          {feature.subtype ? ` · ${feature.subtype}` : ""}
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "ar" ? "الإحداثيات" : "Coordinates"}
        </div>
        <div className="font-mono text-xs bg-muted/40 rounded p-2">
          {coords[0].toFixed(5)}° E
          <br />
          {coords[1].toFixed(5)}° N
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "ar" ? "الخصائص" : "Properties"}
        </div>
        <dl className="text-xs space-y-1">
          {Object.entries(feature.properties).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground capitalize">{k}</dt>
              <dd className="font-medium text-end">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
          {lang === "ar" ? "إجراءات" : "Actions"}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedDatasetId(feature.id);
              setActiveModule("catalog");
              toast.success(lang === "ar" ? "افتح في الكتالوج" : "Opened in catalog");
            }}
          >
            <MapIcon className="size-3.5 me-1.5" />
            {t("catalog.openInMap")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success(lang === "ar" ? "تم إنشاء إشارة مرجعية" : "Bookmark created");
            }}
          >
            <Bookmark className="size-3.5 me-1.5" />
            {t("map.bookmarks")}
          </Button>
        </div>
      </div>
    </div>
  );
}
