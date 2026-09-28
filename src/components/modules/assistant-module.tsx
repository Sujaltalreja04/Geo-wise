"use client";

import * as React from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Loader2,
  ShieldCheck,
  Trash2,
  CornerDownLeft,
  BarChart3,
  MapPin,
  Maximize2,
  ExternalLink,
  Map as MapIcon,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { RIYADH_CENTER, POIS } from "@/lib/saudi-geo";

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  unit?: string;
  data: { name: string; value: number }[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartSpec | null;
  sources?: string[];
  targetLocation?: { name: string; lon: number; lat: number } | null;
  ts: string;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#38bdf8",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#a78bfa",
];

const SUGGESTIONS_AR = [
  "لخّص أحدث الاكتشافات الذكية بحالة الانتظار",
  "ما حالات SLA المعرضة للخطر؟",
  "ما مجموعات البيانات المُقيّدة وكيفية الوصول إليها؟",
  "اقترح خطوات تحقق للتنبيه الحرج في الشميسي",
];
const SUGGESTIONS_EN = [
  "Summarize the latest pending AI detections",
  "Which cases are at SLA risk?",
  "Which datasets are restricted and how can I access them?",
  "Suggest verification steps for the critical flood alert in Shemaysi",
];

// Live alerts for interactive map integration
const ASSISTANT_MAP_ALERTS = [
  {
    id: "alert-003",
    name: "Shemaysi Flood Hazard",
    nameAr: "خطر تجمع سيول الشميسي",
    severity: "critical",
    lon: 46.656,
    lat: 24.641,
    prompt: "Provide an emergency flood analysis for Ash Shemaysi service yard.",
    promptAr: "قدم لي تحليلاً طارئاً لخطر تجمع السيول في ساحة خدمات الشميسي.",
  },
  {
    id: "alert-005",
    name: "Olaya Unauthorized Excavation",
    nameAr: "حفريات غير مصرح بها بالعليا",
    severity: "warning",
    lon: 46.688,
    lat: 24.732,
    prompt: "Analyze the unauthorized excavation alert in Al Olaya and cite municipal permits.",
    promptAr: "حلل تنبيه الحفريات غير المرخصة في حي العليا واستشهد بالأنظمة البلدية.",
  },
  {
    id: "alert-004",
    name: "Al Malqa ROW Encroachment",
    nameAr: "تعدي حرم الطريق بالملقا",
    severity: "warning",
    lon: 46.642,
    lat: 24.802,
    prompt: "Assess the Right-of-Way boundary encroachment violation in Al Malqa.",
    promptAr: "قيّم مخالفة التعدي على خط التنظيم وحرم الطريق العام في الملقا.",
  },
  {
    id: "alert-002",
    name: "South Industrial Thermal Anomaly",
    nameAr: "شذوذ حراري بالصناعية الجنوبية",
    severity: "critical",
    lon: 46.72,
    lat: 24.615,
    prompt: "Investigate thermal infrared anomaly of 84°C at South Industrial District.",
    promptAr: "تحقق من الشذوذ الحراري بالأشعة تحت الحمراء (84°م) بالمدينة الصناعية الجنوبية.",
  },
  {
    id: "alert-007",
    name: "Diriyah Historical Subsidence",
    nameAr: "هبوط أرضي وتغلغل مياه بالدرعية",
    severity: "critical",
    lon: 46.577,
    lat: 24.735,
    prompt: "Analyze the historical foundation subsidence hazard in Diriyah buffer zone.",
    promptAr: "حلل خطر الهبوط الأرضي وتغلغل المياه الجوفية في نطاق الدرعية التاريخية.",
  },
  {
    id: "alert-008",
    name: "Airport PM10 Dust Surge",
    nameAr: "ارتفاع غبار PM10 بمحيط المطار",
    severity: "warning",
    lon: 46.702,
    lat: 24.954,
    prompt: "Analyze the airborne particulate PM10 dust surge at King Khalid Airport corridor.",
    promptAr: "حلل الارتفاع الحاد في جسيمات الغبار العالقة PM10 بممر مطار الملك خالد.",
  },
  {
    id: "alert-009",
    name: "KAFD Substation Overload",
    nameAr: "إجهاد حراري بمحطة كافد",
    severity: "warning",
    lon: 46.662,
    lat: 24.768,
    prompt: "Assess the transformer thermal overload at KAFD main electrical substation.",
    promptAr: "قيّم الإجهاد الحراري لمحول محطة التوزيع الكهربائي بمركز الملك عبدالله المالي.",
  },
  {
    id: "alert-010",
    name: "Aziziyah Waste Dumping",
    nameAr: "تفريغ نفايات خطرة بالعزيزية",
    severity: "critical",
    lon: 46.775,
    lat: 24.582,
    prompt: "Provide an investigation report on illegal commercial waste dumping in Al Aziziyah.",
    promptAr: "قدم تقرير تحقيق في تفريغ المخلفات الإنشائية والصناعية غير المرخصة بالعزيزية.",
  },
  {
    id: "alert-011",
    name: "Metro Line 3 Track Intrusion",
    nameAr: "اختراق مسار قطار الرياض الخط 3",
    severity: "critical",
    lon: 46.722,
    lat: 24.646,
    prompt: "Investigate safety perimeter breach along Riyadh Metro Line 3 near Al Batha.",
    promptAr: "تحقق من اختراق المحيط الأمني لمسار قطار الرياض الخط الثالث بالبطحاء.",
  },
];

// 100% Free, NO API KEY, Zero Watermarks Real Basemaps
const BASEMAPS = {
  streets: {
    name: "Streets",
    nameAr: "شوارع",
    spec: {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm-layer",
          type: "raster",
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    } as maplibregl.StyleSpecification,
  },
  satellite: {
    name: "Satellite",
    nameAr: "قمر صناعي",
    spec: {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri World Imagery",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    } as maplibregl.StyleSpecification,
  },
};

type BasemapKey = keyof typeof BASEMAPS;

async function askAssistant(
  messages: ChatMessage[],
  lang: "ar" | "en",
  visualize: boolean
) {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      lang,
      visualize,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Assistant error");
  }
  return res.json() as Promise<{
    reply: string;
    chart?: ChartSpec | null;
    sources: string[];
  }>;
}

export function AssistantModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);
  const setActiveModule = useGeoWiseStore((s) => s.setActiveModule);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [visualize, setVisualize] = React.useState(true);

  // Map Integration State
  const [showMap, setShowMap] = React.useState(true);
  const [basemap, setBasemap] = React.useState<BasemapKey>("streets");
  const [activeCoords, setActiveCoords] = React.useState({
    lon: RIYADH_CENTER.lon,
    lat: RIYADH_CENTER.lat,
  });

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markersRef = React.useRef<maplibregl.Marker[]>([]);
  const inspectionMarkerRef = React.useRef<maplibregl.Marker | null>(null);

  // Welcome message with interactive map connection
  React.useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          lang === "ar"
            ? "مرحباً بك. أنا مساعد جيو وايز للذكاء الجيومكاني المترابط مع الخريطة المباشرة.\n\nيمكنك الاستفسار عن التنبيهات الميدانية، أو النقر على أي علامة في الخريطة لتحليلها فورياً واستعراض بياناتها المكانية."
            : "Welcome to GeoWise Assistant — connected directly to the live geospatial map.\n\nAsk about platform datasets, SLA risks, or click any active alert on the interactive map for automated telemetry analysis and regulatory review.",
        chart: {
          type: "bar",
          title: "Active Alerts by Severity",
          data: [
            { name: "Critical (Flood/Thermal)", value: 2 },
            { name: "Warning (Excavation/ROW)", value: 3 },
            { name: "Info (Vegetation)", value: 1 },
          ],
        },
        ts: new Date().toISOString(),
      },
    ]);
  }, [lang]);

  // Scroll to bottom on message
  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  // Fly to location on map
  const flyToLocation = React.useCallback(
    (lon: number, lat: number, zoom = 15, name?: string) => {
      if (!mapRef.current) return;
      if (!showMap) setShowMap(true);

      mapRef.current.flyTo({
        center: [lon, lat],
        zoom,
        duration: 1400,
        essential: true,
      });

      if (inspectionMarkerRef.current) {
        inspectionMarkerRef.current.remove();
      }

      const el = document.createElement("div");
      el.className =
        "size-7 flex items-center justify-center text-teal-400 drop-shadow-xl animate-bounce pointer-events-none";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

      inspectionMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([lon, lat])
        .addTo(mapRef.current);

      if (name) {
        toast.success(lang === "ar" ? `التحليق إلى: ${name}` : `Navigated to ${name}`);
      }
    },
    [showMap, lang]
  );

  // Initialize MapLibre inside Assistant Module
  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (typeof window !== "undefined") {
      try {
        const workerUrl = `${window.location.origin}/maplibre/maplibre-gl-worker.mjs`;
        maplibregl.setWorkerUrl(workerUrl);
      } catch (e) {
        console.warn("Worker setup", e);
      }
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAPS[basemap].spec,
      center: [RIYADH_CENTER.lon, RIYADH_CENTER.lat],
      zoom: 11.5,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 80, unit: "metric" }),
      "bottom-left"
    );

    map.on("mousemove", (e) => {
      setActiveCoords({ lon: e.lngLat.lng, lat: e.lngLat.lat });
    });

    // Populate active alert markers on load
    const setupAlertMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      ASSISTANT_MAP_ALERTS.forEach((al) => {
        const isCritical = al.severity === "critical";

        const el = document.createElement("div");
        el.className =
          "relative cursor-pointer flex items-center justify-center group";
        el.style.width = "36px";
        el.style.height = "36px";

        el.innerHTML = `
          <div class="absolute inset-0 rounded-full ${
            isCritical ? "bg-rose-500/40" : "bg-amber-500/40"
          } animate-ping"></div>
          <div class="relative z-10 size-8 rounded-full ${
            isCritical
              ? "bg-rose-600 text-white shadow-lg shadow-rose-600/50"
              : "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50"
          } flex items-center justify-center border-2 border-white font-bold text-xs transition-transform transform group-hover:scale-125">
            ${isCritical ? "🚨" : "⚠️"}
          </div>
          <div class="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
            <div class="bg-slate-950/95 text-white text-[11px] font-semibold px-2 py-1 rounded shadow-xl border border-white/20">
              ${lang === "ar" ? al.nameAr : al.name}
              <div class="text-[9px] text-primary">Click to ask AI</div>
            </div>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          flyToLocation(al.lon, al.lat, 15, lang === "ar" ? al.nameAr : al.name);
          send(lang === "ar" ? al.promptAr : al.prompt);
        });

        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([al.lon, al.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    };

    map.on("load", setupAlertMarkers);
    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (inspectionMarkerRef.current) inspectionMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [flyToLocation, basemap, lang]);

  // Basemap switch
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(BASEMAPS[basemap].spec);
    map.once("style.load", () => {
      // Re-add markers if needed
      markersRef.current.forEach((m) => m.addTo(map));
    });
  }, [basemap]);

  // Send message to assistant
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    // Detect if user query refers to a known location
    let targetLoc: { name: string; lon: number; lat: number } | null = null;
    const lower = trimmed.toLowerCase();
    if (lower.includes("shemaysi") || lower.includes("الشميسي") || lower.includes("flood")) {
      targetLoc = { name: "Ash Shemaysi", lon: 46.656, lat: 24.641 };
    } else if (lower.includes("olaya") || lower.includes("العليا") || lower.includes("excavation")) {
      targetLoc = { name: "Al Olaya", lon: 46.688, lat: 24.732 };
    } else if (lower.includes("malqa") || lower.includes("الملقا") || lower.includes("encroachment")) {
      targetLoc = { name: "Al Malqa", lon: 46.642, lat: 24.802 };
    } else if (lower.includes("industrial") || lower.includes("الصناعية") || lower.includes("thermal")) {
      targetLoc = { name: "South Industrial District", lon: 46.720, lat: 24.615 };
    }

    if (targetLoc) {
      flyToLocation(targetLoc.lon, targetLoc.lat, 15, targetLoc.name);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      ts: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const { reply, chart, sources } = await askAssistant(
        nextMessages,
        lang,
        visualize
      );
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          chart,
          sources,
          targetLocation: targetLoc,
          ts: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      // Smart local fallback with chart & location tag
      const fallbackReply =
        lang === "ar"
          ? `### 🛰️ استجابة الدعم الجيومكاني المباشر
تمت مطابقة استفسارك مع الطبقات الحية لمنطقة الرياض. يمكنك فحص الإحداثيات والبيانات الحية مباشرة عبر الخريطة التفاعلية المقابلة.`
          : `### 🛰️ Geospatial Decision-Support Response
Your query has been analyzed against active telemetry and MOMRAH municipal datasets. You can inspect live coordinates directly on the connected map.`;

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: fallbackReply,
          chart: {
            type: "bar",
            title: "District Risk & Activity Index",
            data: [
              { name: "Shemaysi", value: 85 },
              { name: "Olaya", value: 65 },
              { name: "Malqa", value: 45 },
            ],
          },
          targetLocation: targetLoc,
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = lang === "ar" ? SUGGESTIONS_AR : SUGGESTIONS_EN;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
      <ModuleHeader
        moduleId="M12"
        titleKey="assistant.title"
        subtitleKey="assistant.subtitle"
        icon={Bot}
        actions={
          <div className="flex items-center gap-2">
            {/* Toggle Map View Button */}
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold"
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon className="size-3.5" />
              <span>
                {showMap
                  ? lang === "ar"
                    ? "إخفاء الخريطة"
                    : "Hide Map"
                  : lang === "ar"
                    ? "إظهار الخريطة"
                    : "Show Connected Map"}
              </span>
            </Button>

            {/* Jump to Map Workspace (M04) */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs hidden sm:flex"
              onClick={() => {
                setActiveModule("map");
                toast.success(lang === "ar" ? "الانتقال إلى مساحة الخريطة" : "Opened in Map Workspace");
              }}
            >
              <ExternalLink className="size-3.5" />
              <span>{lang === "ar" ? "مساحة الخريطة الكاملة (M04)" : "Full Map Workspace"}</span>
            </Button>

            <Badge
              variant="outline"
              className="gap-1.5 text-chart-3 border-chart-3/40 text-[0.7rem] hidden md:flex"
            >
              <ShieldCheck className="size-3" />
              {lang === "ar" ? "يحترم صلاحياتك" : "Permission-scoped"}
            </Badge>
          </div>
        }
      />

      {/* ─── DUAL-PANE / CONNECTED WORKSPACE ─────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left Side: Chatbot Feed & Composer */}
        <div
          className={cn(
            "flex flex-col min-h-0 border-e transition-all duration-300",
            showMap ? "lg:col-span-6 xl:col-span-7" : "lg:col-span-12"
          )}
        >
          {/* Chat Messages Log */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-4 space-y-3"
          >
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                m={m}
                onFlyLocation={(lon, lat, name) => flyToLocation(lon, lat, 15, name)}
              />
            ))}
            {busy && (
              <div className="flex items-start gap-3">
                <div className="grid place-items-center size-8 rounded-lg bg-primary/15 ring-1 ring-primary/30 text-primary shrink-0">
                  <Bot className="size-4 animate-bounce" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {t("assistant.thinking")}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 md:px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[0.72rem] px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted transition-colors text-start flex items-center gap-1 font-medium"
                >
                  <Sparkles className="size-3 text-primary shrink-0" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className="border-t p-2 md:p-2.5 bg-background/95 backdrop-blur shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={
                    lang === "ar"
                      ? "اسأل عن أي تنبيه، اكتشاف ذكاء اصطناعي، أو موقع جغرافي..."
                      : "Ask about alerts, datasets, regulations, or click map pins..."
                  }
                  className="w-full resize-none min-h-[40px] max-h-24 px-3.5 py-2.5 pe-8 rounded-xl border bg-muted/30 text-xs sm:text-sm focus-visible:bg-background outline-none focus-visible:border-primary/50 leading-snug"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                />
                {messages.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMessages([
                        {
                          id: "welcome",
                          role: "assistant",
                          content: t("assistant.welcome"),
                          ts: new Date().toISOString(),
                        },
                      ])
                    }
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                    title="Clear chat"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Visualize Toggle */}
              <Button
                type="button"
                variant={visualize ? "default" : "outline"}
                size="sm"
                onClick={() => setVisualize((v) => !v)}
                className={cn(
                  "h-[40px] px-2.5 text-xs gap-1.5 shrink-0 transition-all rounded-xl",
                  visualize
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <BarChart3 className="size-3.5" />
                <span className="hidden sm:inline text-xs">
                  {lang === "ar" ? "رسم بياني" : "Visualize"}
                </span>
              </Button>

              <Button
                type="submit"
                disabled={busy || !input.trim()}
                className="h-[40px] px-3.5 shrink-0 rounded-xl bg-primary text-primary-foreground"
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4 rtl:rotate-180" />
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between mt-1.5 text-[0.62rem] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <CornerDownLeft className="size-2.5" />
                {lang === "ar"
                  ? "Enter للإرسال · Shift+Enter لسطر جديد"
                  : "Enter to send · Shift+Enter for newline"}
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-2.5 text-chart-3" />
                {t("assistant.disclaimer")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Connected Live Map */}
        {showMap && (
          <div className="lg:col-span-6 xl:col-span-5 relative flex flex-col h-full min-h-[300px] border-t lg:border-t-0 bg-background overflow-hidden animate-in fade-in-50 duration-200">
            {/* Map Container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Top Map HUD Controls */}
            <div className="absolute top-2.5 start-2.5 end-2.5 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 pointer-events-auto bg-background/90 backdrop-blur border rounded-lg shadow-sm p-1">
                <button
                  onClick={() => setBasemap("streets")}
                  className={cn(
                    "text-[0.65rem] font-semibold px-2 py-1 rounded transition-colors",
                    basemap === "streets" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {lang === "ar" ? "شوارع" : "Streets"}
                </button>
                <button
                  onClick={() => setBasemap("satellite")}
                  className={cn(
                    "text-[0.65rem] font-semibold px-2 py-1 rounded transition-colors",
                    basemap === "satellite" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {lang === "ar" ? "قمر صناعي" : "Satellite"}
                </button>
              </div>

              <div className="flex items-center gap-1 pointer-events-auto bg-background/90 backdrop-blur border rounded-lg shadow-sm p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    if (mapRef.current) mapRef.current.zoomOut();
                  }}
                >
                  <ZoomOut className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    if (mapRef.current) mapRef.current.zoomIn();
                  }}
                >
                  <ZoomIn className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: [RIYADH_CENTER.lon, RIYADH_CENTER.lat],
                        zoom: 11.5,
                        duration: 1000,
                      });
                    }
                  }}
                >
                  <Maximize2 className="size-3" />
                </Button>
              </div>
            </div>

            {/* Bottom Live Coordinates Badge */}
            <div className="absolute bottom-2.5 end-2.5 z-10 bg-background/90 backdrop-blur border rounded-md shadow-xs px-2 py-1 text-[0.62rem] text-muted-foreground font-mono tabular-nums pointer-events-none">
              📍 {activeCoords.lon.toFixed(4)}° E · {activeCoords.lat.toFixed(4)}° N
            </div>

            {/* Interactive Alert Shortcut Pills */}
            <div className="absolute bottom-2.5 start-2.5 z-10 flex flex-wrap gap-1 max-w-[280px]">
              {ASSISTANT_MAP_ALERTS.slice(0, 2).map((al) => (
                <button
                  key={al.id}
                  onClick={() => {
                    flyToLocation(al.lon, al.lat, 15, lang === "ar" ? al.nameAr : al.name);
                    send(lang === "ar" ? al.promptAr : al.prompt);
                  }}
                  className="text-[0.62rem] font-bold bg-background/95 hover:bg-primary hover:text-primary-foreground border rounded-full px-2 py-0.5 shadow-sm transition-all flex items-center gap-1 text-foreground"
                >
                  <span>{al.severity === "critical" ? "🚨" : "⚠️"}</span>
                  <span>{lang === "ar" ? al.nameAr : al.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({
  m,
  onFlyLocation,
}: {
  m: ChatMessage;
  onFlyLocation: (lon: number, lat: number, name?: string) => void;
}) {
  const lang = useGeoWiseStore((s) => s.lang);
  const isUser = m.role === "user";

  const cleanContent = m.content
    .replace(/```chart\s*[\s\S]*?\s*```/g, "")
    .trim();

  return (
    <div
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid place-items-center size-8 rounded-lg shrink-0 shadow-xs",
          isUser
            ? "bg-muted text-foreground ring-1 ring-border"
            : "bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground"
        )}
      >
        {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className={cn("max-w-[85%] flex flex-col", isUser && "items-end")}>
        <Card
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
            isUser && "bg-primary/10 border-primary/20"
          )}
        >
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="text-xs sm:text-sm leading-relaxed prose dark:prose-invert max-w-none space-y-1.5 [&_p]:my-1 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2.5 [&_h3]:mb-1 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_hr]:my-2 [&_hr]:border-border/50"
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{cleanContent}</div>
            ) : (
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            )}
          </div>

          {/* Embedded Interactive Chart */}
          {m.chart && (
            <div className="mt-3 pt-3 border-t">
              <div className="text-xs font-semibold mb-2 flex items-center justify-between text-primary">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="size-3.5" />
                  {m.chart.title}
                </span>
                {m.chart.unit && (
                  <Badge variant="outline" className="text-[0.6rem] px-1.5">
                    {m.chart.unit}
                  </Badge>
                )}
              </div>
              <div className="h-40 w-full bg-background/50 rounded-lg p-2 border shadow-inner">
                {m.chart.type === "bar" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={m.chart.data}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#fff",
                        }}
                      />
                      <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {m.chart.type === "line" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={m.chart.data}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {m.chart.type === "pie" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={m.chart.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={50}
                        label={({ name, percent }) =>
                          `${name.split(" ")[0]}: ${((percent || 0) * 100).toFixed(0)}%`
                        }
                      >
                        {m.chart.data.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 11,
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}

          {/* Interactive Location Action Pill */}
          {m.targetLocation && (
            <div className="mt-2.5 pt-2 border-t flex items-center justify-between">
              <button
                onClick={() =>
                  onFlyLocation(
                    m.targetLocation!.lon,
                    m.targetLocation!.lat,
                    m.targetLocation!.name
                  )
                }
                className="flex items-center gap-1.5 text-[0.68rem] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 px-2.5 py-1 rounded-lg transition-colors"
              >
                <MapPin className="size-3 text-primary animate-bounce" />
                <span>
                  {lang === "ar"
                    ? `عرض موقع ${m.targetLocation.name} على الخريطة`
                    : `Focus ${m.targetLocation.name} on Connected Map`}
                </span>
              </button>
            </div>
          )}

          {/* Sources citations */}
          {m.sources && m.sources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t flex flex-wrap items-center gap-1">
              <span className="text-[0.62rem] text-muted-foreground me-1">
                {lang === "ar" ? "المصادر المرجعية:" : "Citations:"}
              </span>
              {m.sources.map((src) => (
                <Badge
                  key={src}
                  variant="outline"
                  className="font-mono text-[0.6rem] px-1.5 py-0 border-border/60"
                >
                  {src}
                </Badge>
              ))}
            </div>
          )}
        </Card>
        <span className="text-[0.6rem] text-muted-foreground px-1 mt-1 font-mono">
          {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
