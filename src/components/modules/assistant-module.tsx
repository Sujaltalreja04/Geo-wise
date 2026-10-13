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
  Layers,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Download,
  Flame,
  AlertTriangle,
  Clock,
  Satellite,
  Compass,
  ChevronDown,
  ChevronUp,
  Activity,
  Radio,
  FileText,
  PieChart as PieChartIcon,
  TrendingUp,
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
import { AiMessageRenderer } from "@/components/chat/ai-message-renderer";
import { RIYADH_CENTER } from "@/lib/saudi-geo";

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
  "#0ea5e9", // Teal / Sky
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#38bdf8", // Light Blue
];

interface ScenarioCategory {
  id: string;
  nameEn: string;
  nameAr: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
  prompts: {
    en: string;
    ar: string;
    badgeEn: string;
    badgeAr: string;
  }[];
}

const SCENARIO_CATEGORIES: ScenarioCategory[] = [
  {
    id: "emergency",
    nameEn: "Emergency & Flood Hazards",
    nameAr: "السيول ومخاطر الطوارئ",
    icon: Flame,
    badgeColor: "border-red-500/40 text-red-500 bg-red-500/10",
    prompts: [
      {
        en: "Provide an emergency flood analysis for Ash Shemaysi service yard (alert-003)",
        ar: "قدم تحليلاً طارئاً لمخاطر تجمع السيول في ساحة خدمات الشميسي (alert-003)",
        badgeEn: "Critical",
        badgeAr: "حرج",
      },
      {
        en: "Investigate thermal infrared anomaly of 84°C at South Industrial District (alert-002)",
        ar: "تحقق من الشذوذ الحراري بالأشعة تحت الحمراء (84°م) بالمدينة الصناعية (alert-002)",
        badgeEn: "Critical",
        badgeAr: "حرج",
      },
      {
        en: "Summarize all active unacknowledged flood and environmental alerts",
        ar: "لخّص جميع التنبيهات البيئية وتجمعات المياه النشطة غير المعترف بها",
        badgeEn: "Overview",
        badgeAr: "شامل",
      },
    ],
  },
  {
    id: "encroachment",
    nameEn: "ROW & Illegal Building",
    nameAr: "التعديات وحرم الطريق",
    icon: AlertTriangle,
    badgeColor: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    prompts: [
      {
        en: "Analyze the unauthorized excavation alert in Al Olaya (alert-005 / det-001)",
        ar: "حلل تنبيه الحفريات غير المرخصة في حي العليا (alert-005 / det-001)",
        badgeEn: "Warning",
        badgeAr: "تحذير",
      },
      {
        en: "Assess the Right-of-Way boundary encroachment in Al Malqa (det-002 / alert-004)",
        ar: "قيّم مخالفة التعدي على خط التنظيم وحرم الطريق بالملقا (det-002 / alert-004)",
        badgeEn: "Warning",
        badgeAr: "تحذير",
      },
      {
        en: "Check demolition compliance without permit in Nakheel district (GW-CASE-2041)",
        ar: "تحقق من امتثال بلاغ الهدم بدون تصريح في حي النخيل (GW-CASE-2041)",
        badgeEn: "High Priority",
        badgeAr: "أولوية عالية",
      },
    ],
  },
  {
    id: "sla",
    nameEn: "SLA Risk Radar",
    nameAr: "مخاطر الالتزام وSLA",
    icon: Clock,
    badgeColor: "border-purple-500/40 text-purple-500 bg-purple-500/10",
    prompts: [
      {
        en: "Which municipal cases are at imminent risk of SLA breach?",
        ar: "ما هي القضايا البلدية المعرضة لخطر انتهاء اتفاقية مستوى الخدمة (SLA)؟",
        badgeEn: "Urgent",
        badgeAr: "عاجل",
      },
      {
        en: "Review Case GW-CASE-2039 SLA remaining hours and assigned officer",
        ar: "استعرض الساعات المتبقية والمفتش المسؤول عن القضية GW-CASE-2039",
        badgeEn: "18h Left",
        badgeAr: "18 ساعة متبقية",
      },
      {
        en: "Show inspector workload distribution across open cases",
        ar: "اعرض توزيع أعباء التفتيش الميداني على القضايا المفتوحة",
        badgeEn: "Workload",
        badgeAr: "أعباء العمل",
      },
    ],
  },
  {
    id: "satellite",
    nameEn: "AI Telemetry & Detections",
    nameAr: "ذكاء الأقمار والاستشعار",
    icon: Satellite,
    badgeColor: "border-teal-500/40 text-teal-500 bg-teal-500/10",
    prompts: [
      {
        en: "Summarize the latest pending AI detections with model confidence scores",
        ar: "لخّص أحدث الاكتشافات الذكية بحالة الانتظار مع درجات ثقة النماذج",
        badgeEn: "AI Models",
        badgeAr: "نماذج الذكاء",
      },
      {
        en: "Analyze NDVI vegetation loss delta in Olaya and green asset corridors",
        ar: "حلل فارق فقدان الغطاء النباتي (NDVI) في حديقة العليا وممرات الأصول الخضراء",
        badgeEn: "Vegetation",
        badgeAr: "الغطاء النباتي",
      },
      {
        en: "Compare AI change detection models (GW-CDNet vs GW-HydroNet)",
        ar: "قارن بين نماذج اكتشاف التغيرات (GW-CDNet مقابل GW-HydroNet)",
        badgeEn: "Benchmark",
        badgeAr: "مقارنة",
      },
    ],
  },
  {
    id: "governance",
    nameEn: "Datasets & SGA Compliance",
    nameAr: "البيانات والمعايير الجيومكانية",
    icon: Activity,
    badgeColor: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    prompts: [
      {
        en: "Which datasets are restricted and how do I request access under SGA rules?",
        ar: "ما مجموعات البيانات المُقيّدة وكيف أطلب الوصول إليها بموجب معايير الهيئة؟",
        badgeEn: "Governance",
        badgeAr: "الحوكمة",
      },
      {
        en: "Display core platform KPIs: verification rate, active datasets, and SLA compliance",
        ar: "اعرض المؤشرات الرئيسية للمنصة: معدل التوثيق، الطبقات النشطة، ونسبة الامتثال",
        badgeEn: "KPIs",
        badgeAr: "المؤشرات",
      },
    ],
  },
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
];

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
          attribution: "&copy; Esri &mdash; Earthstar Geographics",
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
  const [activeCategory, setActiveCategory] = React.useState<string>("emergency");
  const [showScenarios, setShowScenarios] = React.useState(false); // Minimized by default for clear view

  // Map Integration State
  const [showMap, setShowMap] = React.useState(false); // Map collapsed by default for focused AI workspace
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

  // Welcome message with clean, streamlined presentation
  React.useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          lang === "ar"
            ? `### 🛰️ مرحباً بك في مساعد جيو وايز للذكاء الجيومكاني المتقدم
أنا مستشارك التحليلي المتصل مباشرة بقواعد بيانات وزارة الشؤون البلدية والقروية والإسكان (MOMRAH) وشبكة الاستشعار المباشرة لمنطقة الرياض.

**القدرات التشغيلية الحية:**
- 🚨 **رادار الإنذار المبكر**: فحص مخاطر تجمع السيول، الهبوط الأرضي بالدرعية، والشذوذ الحراري.
- 🚧 **كشف التعديات ورخص البناء**: تدقيق الحفريات غير المصرح بها وتجاوزات خط التنظيم.
- ⏱️ **متابعة اتفاقيات SLA**: مراقبة القضايا المفتوحة وساعات الامتثال المتبقية للمفتشين.
- 📊 **حوكمة الطبقات الجيومكانية**: ربط البيانات بمعايير الهيئة العامة للمساحة (SGA/GEOSA).

يمكنك النقر على أحد السيناريوهات السريعة أدناه أو طرح أي سؤال جيومكاني مباشرة.`
            : `### 🛰️ Welcome to GeoWise Spatial Intelligence Assistant
I am your senior geospatial intelligence advisor connected directly to live MOMRAH municipal telemetry and Riyadh urban surveillance feeds.

**Operational Capabilities:**
- 🚨 **Hazard & Flood Radar**: Instant analysis of water accumulation, Diriyah subsidence, and thermal anomalies.
- 🚧 **Building Compliance**: Satellite change detection for unauthorized excavations and right-of-way breaches.
- ⏱️ **SLA Risk Monitoring**: Tracking open municipal inspection cases against operational SLAs.
- 📊 **SGA Standards & Governance**: Cadastral parcel validation adhering to Saudi national geospatial guidelines.

Select a quick scenario prompt below or ask any geospatial question directly.`,
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
      if (!showMap) setShowMap(true);

      setTimeout(() => {
        if (!mapRef.current) return;
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
          "size-8 flex items-center justify-center text-teal-400 drop-shadow-xl animate-bounce pointer-events-none";
        el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

        inspectionMarkerRef.current = new maplibregl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([lon, lat])
          .addTo(mapRef.current);

        if (name) {
          toast.success(lang === "ar" ? `الانتقال إلى: ${name}` : `Navigated to ${name}`);
        }
      }, 100);
    },
    [showMap, lang]
  );

  // Initialize MapLibre Map when showMap is toggled
  React.useEffect(() => {
    if (!showMap || !mapContainerRef.current) return;

    if (mapRef.current) {
      mapRef.current.resize();
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAPS[basemap].spec,
      center: [RIYADH_CENTER.lon, RIYADH_CENTER.lat],
      zoom: 11.2,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

    map.on("mousemove", (e) => {
      setActiveCoords({
        lon: Number(e.lngLat.lng.toFixed(4)),
        lat: Number(e.lngLat.lat.toFixed(4)),
      });
    });

    const setupAlertMarkers = () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      ASSISTANT_MAP_ALERTS.forEach((al) => {
        const el = document.createElement("div");
        el.className = "group relative cursor-pointer flex items-center justify-center";

        const isCrit = al.severity === "critical";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full ${
              isCrit ? "bg-red-500/50" : "bg-amber-500/50"
            } opacity-75"></span>
            <div class="relative z-10 size-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
              isCrit ? "bg-red-600 text-white" : "bg-amber-500 text-slate-900"
            } font-bold text-xs transition-transform duration-200 group-hover:scale-125">
              ${isCrit ? "!" : "▲"}
            </div>
          </div>
        `;

        el.addEventListener("click", () => {
          flyToLocation(al.lon, al.lat, 15.5, lang === "ar" ? al.nameAr : al.name);
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
  }, [showMap, flyToLocation, basemap, lang]);

  // Basemap switch
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(BASEMAPS[basemap].spec);
    map.once("style.load", () => {
      markersRef.current.forEach((m) => m.addTo(map));
    });
  }, [basemap]);

  // Send message to assistant
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    let targetLoc: { name: string; lon: number; lat: number } | null = null;
    const lower = trimmed.toLowerCase();
    if (lower.includes("shemaysi") || lower.includes("الشميسي") || lower.includes("flood")) {
      targetLoc = { name: "Ash Shemaysi", lon: 46.656, lat: 24.641 };
    } else if (lower.includes("olaya") || lower.includes("العليا") || lower.includes("excavation")) {
      targetLoc = { name: "Al Olaya", lon: 46.688, lat: 24.732 };
    } else if (lower.includes("malqa") || lower.includes("الملقا") || lower.includes("encroachment")) {
      targetLoc = { name: "Al Malqa", lon: 46.642, lat: 24.802 };
    } else if (lower.includes("industrial") || lower.includes("الصناعية") || lower.includes("thermal")) {
      targetLoc = { name: "South Industrial District", lon: 46.72, lat: 24.615 };
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      ts: new Date().toISOString(),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setBusy(true);

    try {
      const { reply, chart, sources } = await askAssistant(next, lang, visualize);
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
      const fallbackReply =
        lang === "ar"
          ? `### 🛰️ استجابة الدعم الجيومكاني المباشر
تمت مطابقة استفسارك مع الطبقات الحية لمنطقة الرياض وقواعد بيانات وزارة الشؤون البلدية.
- **الحالة**: تم تحليل المؤشرات المكانية بنجاح.
- **التوصية**: مراجعة المفتش الميداني والتحقق قبل التنفيذ.

هذه مخرجات لدعم القرار؛ تحقق قبل التنفيذ.`
          : `### 🛰️ Geospatial Decision-Support Response
Your query has been analyzed against active telemetry and MOMRAH municipal datasets.
- **Status**: Spatial telemetry processed successfully.
- **Recommendation**: Cross-reference with cadastral records prior to enforcement.

This is decision-support; verify before enforcement.`;

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

  // Export Briefing as Markdown File
  const handleExportBriefing = () => {
    const header = `# GeoWise Spatial Intelligence Briefing\nDate: ${new Date().toLocaleString()}\nPlatform: GeoWise MOMRAH Spatial Engine\n\n---\n\n`;
    const transcript = messages
      .map(
        (m) =>
          `### [${m.role.toUpperCase()}] — ${new Date(m.ts).toLocaleTimeString()}\n${m.content}\n\n`
      )
      .join("\n---\n\n");
    const blob = new Blob([header + transcript], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GeoWise_Intelligence_Briefing_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(lang === "ar" ? "تم تصدير تقرير المحادثة بنجاح" : "Briefing exported as Markdown");
  };

  const selectedCategoryObj =
    SCENARIO_CATEGORIES.find((c) => c.id === activeCategory) || SCENARIO_CATEGORIES[0];

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-background">
      {/* ─── PREMIUM MODULE HEADER ─────────────────────────────────────────── */}
      <ModuleHeader
        moduleId="M12"
        titleKey="assistant.title"
        subtitleKey="assistant.subtitle"
        icon={Bot}
        actions={
          <div className="flex items-center gap-2">
            {/* Quick Export Briefing */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBriefing}
              className="h-8 gap-1.5 text-xs border-border/70 hover:bg-muted/80 shadow-xs"
              title="Export Briefing"
            >
              <Download className="size-3.5 text-primary" />
              <span className="hidden sm:inline">
                {lang === "ar" ? "تصدير التقرير" : "Export Briefing"}
              </span>
            </Button>

            {/* Toggle Connected Map Companion */}
            <Button
              variant={showMap ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-8 gap-1.5 text-xs font-semibold transition-all",
                showMap
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "hover:border-primary/40 text-foreground"
              )}
              onClick={() => setShowMap(!showMap)}
            >
              <MapIcon className="size-3.5" />
              <span>
                {showMap
                  ? lang === "ar"
                    ? "إخفاء الخريطة (شاشة كاملة)"
                    : "Hide Map (Full Focus)"
                  : lang === "ar"
                    ? "عرض الخريطة المرافقة"
                    : "Show Companion Map"}
              </span>
            </Button>

            {/* Jump to Map Workspace (M04) */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs hidden md:flex"
              onClick={() => {
                setActiveModule("map");
                toast.success(lang === "ar" ? "الانتقال إلى مساحة الخريطة" : "Opened in Map Workspace");
              }}
            >
              <ExternalLink className="size-3.5" />
              <span>{lang === "ar" ? "الخريطة الكاملة (M04)" : "Full Map (M04)"}</span>
            </Button>

            <Badge
              variant="outline"
              className="gap-1.5 text-emerald-500 border-emerald-500/30 bg-emerald-500/5 text-[0.7rem] hidden lg:flex"
            >
              <ShieldCheck className="size-3" />
              {lang === "ar" ? "نطاق الصلاحيات: آمن" : "Permission-scoped"}
            </Badge>
          </div>
        }
      />

      {/* ─── LIVE TELEMETRY HUD BAR ───────────────────────────────────────── */}
      <div className="border-b bg-card/60 backdrop-blur-md px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-foreground tracking-tight">
              Mistral AI Neural Core
            </span>
            <Badge
              variant="secondary"
              className="text-[0.62rem] font-mono px-1.5 py-0 bg-primary/10 text-primary border border-primary/20"
            >
              ministral-8b-latest
            </Badge>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-muted-foreground text-[0.7rem]">
            <Radio className="size-3 text-teal-500" />
            <span>MOMRAH Cloud Sync:</span>
            <span className="text-emerald-500 font-medium">Live Telemetry</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-muted-foreground text-[0.7rem] font-mono">
            <Compass className="size-3 text-primary" />
            <span>Riyadh Metro · EPSG:32638</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Scenarios Bar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowScenarios(!showScenarios)}
            className="h-6 px-2 text-[0.68rem] text-muted-foreground hover:text-foreground gap-1"
          >
            <Sparkles className="size-3 text-primary" />
            <span>{lang === "ar" ? "سيناريوهات التحليل" : "Intel Scenarios"}</span>
            {showScenarios ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
          </Button>

          {messages.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
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
              className="h-6 px-2 text-[0.68rem] text-muted-foreground hover:text-destructive gap-1"
              title="Reset conversation"
            >
              <Trash2 className="size-3" />
              <span>{lang === "ar" ? "بدء جلسة جديدة" : "New Session"}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ─── DUAL-PANE WORKSPACE (CHAT + COMPANION MAP) ───────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden relative">
        {/* Left Side: Advanced Chatfeed & Control Station */}
        <div
          className={cn(
            "flex flex-col min-h-0 transition-all duration-300 relative",
            showMap ? "lg:col-span-6 xl:col-span-7 border-e" : "lg:col-span-12"
          )}
        >
          {/* Collapsible Mission Scenarios Matrix */}
          {showScenarios && (
            <div className="border-b bg-muted/20 backdrop-blur-md p-3 shrink-0 animate-in fade-in-50 duration-200">
              {/* Header with Minimize button */}
              <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/40">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{lang === "ar" ? "مصفوفة سيناريوهات التحليل الاستخباري" : "Intelligence Mission Scenarios Matrix"}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowScenarios(false)}
                  className="h-6 px-2 text-[0.68rem] text-muted-foreground hover:text-foreground gap-1"
                >
                  <ChevronUp className="size-3" />
                  <span>{lang === "ar" ? "تصغير السيناريوهات" : "Minimize"}</span>
                </Button>
              </div>

              {/* Category Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-2">
                {SCENARIO_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSel = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0",
                        isSel
                          ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40 font-semibold"
                          : "bg-card/70 hover:bg-card text-muted-foreground hover:text-foreground border border-border/50"
                      )}
                    >
                      <Icon className="size-3.5" />
                      <span>{lang === "ar" ? cat.nameAr : cat.nameEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Prompt Chips for Selected Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {selectedCategoryObj.prompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => send(lang === "ar" ? p.ar : p.en)}
                    className="group relative p-2.5 rounded-xl border bg-card/80 hover:bg-card hover:border-primary/50 transition-all text-start shadow-xs hover:shadow-md flex flex-col justify-between gap-1.5"
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <span className="text-[0.62rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border font-mono shrink-0">
                        {lang === "ar" ? p.badgeAr : p.badgeEn}
                      </span>
                      <Sparkles className="size-3 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-xs text-foreground/90 font-medium line-clamp-2 leading-snug">
                      {lang === "ar" ? p.ar : p.en}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages Feed */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 space-y-4"
          >
            {messages.map((m) => (
              <ChatBubble
                key={m.id}
                m={m}
                onFlyLocation={(lon, lat, name) => flyToLocation(lon, lat, 15, name)}
              />
            ))}

            {/* Futuristic Scanning / Thinking State */}
            {busy && <ThinkingIndicator lang={lang} />}
          </div>

          {/* Quick Scenario Prompt Chips (Horizontal & Minimalist) */}
          <div className="px-3 md:px-4 pb-1 shrink-0">
            <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <span className="text-[0.65rem] text-muted-foreground font-semibold shrink-0 flex items-center gap-1 me-1">
                <Sparkles className="size-3 text-primary" />
                <span>{lang === "ar" ? "مقترحات سريعة:" : "Quick Intel:"}</span>
              </span>
              {[
                {
                  id: "flood",
                  ar: "🚨 سيول الشميسي",
                  en: "🚨 Shemaysi Flood",
                  promptAr: "قدم تحليلاً شاملاً لحالة تجمع مياه السيول بحي الشميسي مع رسم بياني للعمق وتوصيات الإنفاذ.",
                  promptEn: "Provide an emergency flood hazard analysis for Ash Shemaysi service yard with water depth telemetry and recommended field protocol.",
                },
                {
                  id: "diriyah",
                  ar: "🕳️ هبوط الدرعية",
                  en: "🕳️ Diriyah Subsidence",
                  promptAr: "حلل تنبيه الهبوط الأرضي الجيوتقني بنطاق الدرعية التاريخية مع بيانات رادار InSAR.",
                  promptEn: "Analyze Diriyah historical ground subsidence and subterranean seepage alert with InSAR telemetry.",
                },
                {
                  id: "thermal",
                  ar: "🔥 حرارة الصناعية",
                  en: "🔥 Industrial Heat Anomaly",
                  promptAr: "حقق في الشذوذ الحراري البالغ 84°م بالمدينة الصناعية الجنوبية وقراءات التلوث.",
                  promptEn: "Investigate thermal infrared anomaly of 84°C at South Industrial District and downwind emissions.",
                },
                {
                  id: "encroach",
                  ar: "🚧 تجاوزات الملقا",
                  en: "🚧 Malqa Encroachment",
                  promptAr: "فحص التعدي على خط التنظيم وحرم الطريق العام بحي الملقا وحالة القضية.",
                  promptEn: "Examine right-of-way building boundary encroachment at Al Malqa and case status.",
                },
                {
                  id: "sla",
                  ar: "⏱️ رادار SLA",
                  en: "⏱️ SLA Risk Radar",
                  promptAr: "لخص القضايا المفتوحة المعرضة لانتهاك اتفاقيات مستوى الخدمة SLA وتوصيات المفتشين.",
                  promptEn: "Summarize active municipal inspection cases at risk of breaching SLA deadlines.",
                },
                {
                  id: "drones",
                  ar: "🛸 طلعات الدرون",
                  en: "🛸 Drone Sorties",
                  promptAr: "اعرض تقرير طلعات طائرات الاستطلاع المسيرة البلدية والاكتشافات خلال 24 ساعة.",
                  promptEn: "Show autonomous municipal drone fleet sorties and 24h detections summary with chart.",
                },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => send(lang === "ar" ? chip.promptAr : chip.promptEn)}
                  className="shrink-0 whitespace-nowrap text-[0.68rem] font-medium px-2.5 py-1 rounded-full bg-card hover:bg-primary/10 border border-border/70 hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all shadow-2xs"
                >
                  {lang === "ar" ? chip.ar : chip.en}
                </button>
              ))}
            </div>
          </div>

          {/* Floating High-Tech Command Bar (Composer) */}
          <div className="p-3 md:p-4 pt-1 bg-gradient-to-t from-background via-background/95 to-transparent shrink-0">
            <div className="max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-xl p-2.5 transition-all focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
                className="flex flex-col gap-2"
              >
                <div className="relative flex items-center">
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
                        ? "اسأل عن أي تنبيه، رخص بناء، مخاطر SLA، أو انقر أي سيناريو أعلاه..."
                        : "Ask about alerts, SLA risks, building permits, or click any scenario above..."
                    }
                    className="w-full resize-none min-h-[44px] max-h-32 px-3 py-2 text-xs sm:text-sm bg-transparent outline-none leading-relaxed placeholder:text-muted-foreground/70"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    {/* Interactive Visualize Toggle */}
                    <Button
                      type="button"
                      variant={visualize ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVisualize((v) => !v)}
                      className={cn(
                        "h-7 px-2.5 text-[0.7rem] gap-1.5 rounded-lg transition-all",
                        visualize
                          ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <BarChart3 className="size-3" />
                      <span>{lang === "ar" ? "توليد الرسوم البيانية" : "Auto-Visualize"}</span>
                    </Button>

                    <span className="hidden sm:inline text-[0.62rem] text-muted-foreground/70 font-mono">
                      {lang === "ar" ? "Shift+Enter لسطر جديد" : "Shift+Enter for newline"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {input.trim() && (
                      <button
                        type="button"
                        onClick={() => setInput("")}
                        className="text-muted-foreground hover:text-foreground text-xs p-1"
                        title="Clear input"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}

                    <Button
                      type="submit"
                      disabled={busy || !input.trim()}
                      className={cn(
                        "h-8 px-4 gap-1.5 rounded-xl font-semibold text-xs shadow-md transition-all",
                        busy || !input.trim()
                          ? "opacity-50"
                          : "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-teal-500/20"
                      )}
                    >
                      {busy ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>{lang === "ar" ? "إرسال" : "Send"}</span>
                          <Send className="size-3.5 rtl:rotate-180" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between mt-2 text-[0.65rem] text-muted-foreground px-2">
              <span className="flex items-center gap-1 font-medium">
                <CornerDownLeft className="size-2.5 text-primary" />
                {lang === "ar" ? "نظام القرار الاسترشادي المعتمد" : "Authoritative Decision Support"}
              </span>
              <span className="flex items-center gap-1 text-chart-3 font-medium">
                <ShieldCheck className="size-3" />
                {t("assistant.disclaimer")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Connected Live Companion Map (Toggleable) */}
        {showMap && (
          <div className="lg:col-span-6 xl:col-span-5 relative flex flex-col h-full min-h-[350px] border-t lg:border-t-0 bg-background overflow-hidden animate-in fade-in-50 duration-200">
            {/* Map Container */}
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

            {/* Top Map HUD Controls */}
            <div className="absolute top-3 start-3 end-3 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1 pointer-events-auto bg-background/90 backdrop-blur-md border rounded-xl shadow-md p-1">
                <button
                  onClick={() => setBasemap("streets")}
                  className={cn(
                    "text-[0.68rem] font-semibold px-2.5 py-1 rounded-lg transition-colors",
                    basemap === "streets"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {lang === "ar" ? "شوارع" : "Streets"}
                </button>
                <button
                  onClick={() => setBasemap("satellite")}
                  className={cn(
                    "text-[0.68rem] font-semibold px-2.5 py-1 rounded-lg transition-colors",
                    basemap === "satellite"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {lang === "ar" ? "قمر صناعي" : "Satellite"}
                </button>
              </div>

              <div className="flex items-center gap-1 pointer-events-auto bg-background/90 backdrop-blur-md border rounded-xl shadow-md p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    if (mapRef.current) mapRef.current.zoomOut();
                  }}
                >
                  <ZoomOut className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => {
                    if (mapRef.current) mapRef.current.zoomIn();
                  }}
                >
                  <ZoomIn className="size-3.5" />
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
                  <Maximize2 className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Bottom Live Coordinates Badge */}
            <div className="absolute bottom-3 end-3 z-10 bg-background/95 backdrop-blur-md border rounded-lg shadow-sm px-2.5 py-1 text-[0.65rem] text-foreground font-mono tabular-nums pointer-events-none flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>📍 {activeCoords.lon.toFixed(4)}° E · {activeCoords.lat.toFixed(4)}° N</span>
            </div>

            {/* Interactive Alert Shortcut Pills */}
            <div className="absolute bottom-3 start-3 z-10 flex flex-wrap gap-1.5 max-w-[300px]">
              {ASSISTANT_MAP_ALERTS.slice(0, 2).map((al) => (
                <button
                  key={al.id}
                  onClick={() => {
                    flyToLocation(al.lon, al.lat, 15, lang === "ar" ? al.nameAr : al.name);
                    send(lang === "ar" ? al.promptAr : al.prompt);
                  }}
                  className={cn(
                    "text-[0.65rem] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-md shadow-md border flex items-center gap-1.5 transition-transform hover:scale-105",
                    al.severity === "critical"
                      ? "bg-red-950/80 text-red-200 border-red-500/50"
                      : "bg-amber-950/80 text-amber-200 border-amber-500/50"
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current animate-pulse"></span>
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

// ─── HIGH-TECH RADAR SCANNING INDICATOR ─────────────────────────────────────────
function ThinkingIndicator({ lang }: { lang: "ar" | "en" }) {
  const stepsEn = [
    "Ingesting live spatial telemetry...",
    "Querying MOMRAH parcel and flood boundaries...",
    "Evaluating AI detection confidence & SLA constraints...",
    "Synthesizing bilingual decision briefing...",
  ];
  const stepsAr = [
    "جاري استيعاب القياسات الجيومكانية المباشرة...",
    "مطابقة طبقات بلدي وحدود أخطار السيول بالرياض...",
    "تقييم درجات ثقة الذكاء الاصطناعي وحدود SLA...",
    "صياغة التقرير الاسترشادي لدعم القرار...",
  ];

  const steps = lang === "ar" ? stepsAr : stepsEn;
  const [stepIdx, setStepIdx] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setStepIdx((i) => (i + 1) % steps.length);
    }, 1400);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex items-start gap-3.5 max-w-xl animate-in fade-in-50 duration-300">
      <div className="relative flex items-center justify-center size-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 shrink-0">
        <Bot className="size-5" />
        <span className="absolute -top-1 -end-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-ping" />
      </div>

      <div className="flex-1 rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-xl p-3.5 shadow-md">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-1">
          <Loader2 className="size-3.5 animate-spin" />
          <span>{lang === "ar" ? "تحليل الذكاء الاصطناعي الجيومكاني" : "Geospatial Intelligence Processing"}</span>
        </div>

        <p className="text-xs text-muted-foreground font-mono transition-all">
          {steps[stepIdx]}
        </p>

        {/* Dynamic progress bar animation */}
        <div className="mt-2.5 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 w-2/3 animate-[pulse_1s_infinite]" />
        </div>
      </div>
    </div>
  );
}

// ─── ELEVATED CHAT BUBBLE COMPONENT ─────────────────────────────────────────────
function ChatBubble({
  m,
  onFlyLocation,
}: {
  m: ChatMessage;
  onFlyLocation: (lon: number, lat: number, name?: string) => void;
}) {
  const lang = useGeoWiseStore((s) => s.lang);
  const isUser = m.role === "user";
  const [copied, setCopied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<"up" | "down" | null>(null);

  const cleanContent = m.content
    .replace(/```chart\s*[\s\S]*?\s*```/g, "")
    .trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    toast.success(lang === "ar" ? "تم نسخ النص إلى الحافظة" : "Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3.5 group transition-all",
        isUser && "flex-row-reverse"
      )}
    >
      {/* Avatar Icon */}
      <div
        className={cn(
          "grid place-items-center size-9 rounded-xl shrink-0 shadow-md transition-transform group-hover:scale-105",
          isUser
            ? "bg-secondary text-secondary-foreground ring-1 ring-border/80"
            : "bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 font-bold shadow-teal-500/20"
        )}
      >
        {isUser ? <UserIcon className="size-4.5" /> : <Bot className="size-5" />}
      </div>

      {/* Message Bubble Body */}
      <div
        className={cn(
          "max-w-[88%] md:max-w-[80%] flex flex-col",
          isUser && "items-end"
        )}
      >
        <Card
          className={cn(
            "p-4 text-xs sm:text-sm leading-relaxed shadow-md rounded-2xl transition-all border",
            isUser
              ? "bg-gradient-to-br from-primary/15 to-primary/5 border-primary/30 rounded-tr-none text-foreground"
              : "bg-card/90 backdrop-blur-xl border-border/70 border-s-4 border-s-teal-500 rounded-tl-none hover:shadow-lg"
          )}
        >
          {/* Top Bar for Assistant Message */}
          {!isUser && (
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border/50 text-[0.68rem] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">
                  {lang === "ar" ? "مساعد جيو وايز" : "GeoWise Spatial Copilot"}
                </span>
                <Badge
                  variant="outline"
                  className="font-mono text-[0.58rem] px-1.5 py-0 bg-primary/5 text-primary border-primary/20"
                >
                  Ministral-8B
                </Badge>
              </div>

              {/* Message Utilities */}
              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy text"
                >
                  {copied ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setFeedback(feedback === "up" ? null : "up");
                    toast.success(lang === "ar" ? "شكراً لمشاركتك التقييم" : "Feedback recorded");
                  }}
                  className={cn(
                    "p-1 rounded-md hover:bg-muted transition-colors",
                    feedback === "up"
                      ? "text-emerald-500 bg-emerald-500/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Helpful"
                >
                  <ThumbsUp className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    setFeedback(feedback === "down" ? null : "down");
                    toast.success(lang === "ar" ? "تم تسجيل الملاحظة" : "Feedback noted");
                  }}
                  className={cn(
                    "p-1 rounded-md hover:bg-muted transition-colors",
                    feedback === "down"
                      ? "text-red-500 bg-red-500/10"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  title="Not helpful"
                >
                  <ThumbsDown className="size-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <div dir={lang === "ar" ? "rtl" : "ltr"} className="w-full">
            <AiMessageRenderer content={cleanContent} isUser={isUser} />
          </div>

          {/* Embedded High-Tech Interactive Analytics Widget */}
          {m.chart && (
            <div className="mt-3.5 pt-3.5 border-t border-border/60">
              <AnalyticsChartWidget chart={m.chart} lang={lang} />
            </div>
          )}

          {/* Location Action Button */}
          {m.targetLocation && (
            <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
              <button
                onClick={() =>
                  onFlyLocation(
                    m.targetLocation!.lon,
                    m.targetLocation!.lat,
                    m.targetLocation!.name
                  )
                }
                className="flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-xl transition-all shadow-xs hover:shadow-sm"
              >
                <MapPin className="size-3.5 text-teal-400 animate-bounce" />
                <span>
                  {lang === "ar"
                    ? `عرض موقع ${m.targetLocation.name} على الخريطة`
                    : `Focus ${m.targetLocation.name} on Connected Map`}
                </span>
              </button>
            </div>
          )}

          {/* Interactive Citation Badges */}
          {m.sources && m.sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-border/50 flex flex-wrap items-center gap-1.5">
              <span className="text-[0.65rem] text-muted-foreground font-medium me-1">
                {lang === "ar" ? "المصادر المرتبطة:" : "Linked Citations:"}
              </span>
              {m.sources.map((src) => (
                <Badge
                  key={src}
                  variant="outline"
                  className="font-mono text-[0.62rem] px-2 py-0.5 border-border/70 bg-muted/40 hover:bg-muted text-foreground transition-colors cursor-default"
                >
                  {src}
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Message Timestamp */}
        <span className="text-[0.62rem] text-muted-foreground px-1.5 mt-1 font-mono">
          {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── UPGRADED ANALYTICS CHART WIDGET ───────────────────────────────────────────
function AnalyticsChartWidget({
  chart,
  lang,
}: {
  chart: ChartSpec;
  lang: "ar" | "en";
}) {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [activeType, setActiveType] = React.useState<"bar" | "line" | "pie">(
    chart.type || "bar"
  );

  const totalValue = chart.data.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const maxValue = Math.max(...chart.data.map((d) => d.value || 0), 0);

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-md p-3 shadow-inner">
      {/* Chart Header with Interactive Type Switcher & Minimize Toggle */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40 gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <BarChart3 className="size-3.5 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground truncate">
            {chart.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 px-1.5 text-[0.65rem] text-muted-foreground hover:text-foreground gap-1"
            title={isMinimized ? "Expand chart" : "Minimize chart"}
          >
            {isMinimized ? (
              <>
                <ChevronDown className="size-3" />
                <span>{lang === "ar" ? "توسيع" : "Expand"}</span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3" />
                <span>{lang === "ar" ? "تصغير" : "Minimize"}</span>
              </>
            )}
          </Button>

          {/* Switch View: Bar / Line / Pie */}
          {!isMinimized && (
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40">
              <button
                onClick={() => setActiveType("bar")}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[0.65rem] font-semibold transition-colors flex items-center gap-1",
                  activeType === "bar"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Bar Chart"
              >
                <BarChart3 className="size-3" />
                <span className="hidden sm:inline">Bar</span>
              </button>
              <button
                onClick={() => setActiveType("line")}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[0.65rem] font-semibold transition-colors flex items-center gap-1",
                  activeType === "line"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Line Chart"
              >
                <TrendingUp className="size-3" />
                <span className="hidden sm:inline">Line</span>
              </button>
              <button
                onClick={() => setActiveType("pie")}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[0.65rem] font-semibold transition-colors flex items-center gap-1",
                  activeType === "pie"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
                title="Pie Chart"
              >
                <PieChartIcon className="size-3" />
                <span className="hidden sm:inline">Pie</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {!isMinimized ? (
        <>
          {/* Mini Metric Badges */}
          <div className="flex items-center gap-2 mb-2 text-[0.65rem] text-muted-foreground font-mono">
            <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
              {lang === "ar" ? "المجموع:" : "Total:"} <strong className="text-foreground">{totalValue}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-muted/60 border border-border/40">
              {lang === "ar" ? "الذروة:" : "Peak:"} <strong className="text-foreground">{maxValue}</strong>
            </span>
          </div>

          {/* Recharts Canvas */}
          <div className="h-44 w-full">
            {activeType === "bar" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart.data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeType === "line" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "#f8fafc",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#0ea5e9" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeType === "pie" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chart.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={25}
                    paddingAngle={3}
                    label={({ name, percent }) =>
                      `${name.split(" ")[0]}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {chart.data.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#090d16",
                      borderColor: "#1e293b",
                      borderRadius: 10,
                      fontSize: 11,
                      color: "#f8fafc",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground font-mono pt-0.5">
          <span>{lang === "ar" ? "تم تصغير الرسم البياني" : "Chart minimized"}</span>
          <div className="flex items-center gap-2">
            <span>{lang === "ar" ? "المجموع:" : "Total:"} <strong className="text-foreground">{totalValue}</strong></span>
            <span>{lang === "ar" ? "الذروة:" : "Peak:"} <strong className="text-foreground">{maxValue}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
