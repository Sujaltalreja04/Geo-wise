"use client";

import * as React from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
  MapPin,
  Bot,
  Send,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Maximize,
  RefreshCw,
  Loader2,
  BarChart3,
  TrendingUp,
  FileCheck2,
  BellRing,
  Share2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Wind,
  Thermometer,
  Radio,
  Plane,
  ShieldAlert,
  AlertTriangle,
  Activity,
  Filter,
  Trash2,
  Cpu,
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
import { cn } from "@/lib/utils";
import { RIYADH_CENTER, POIS } from "@/lib/saudi-geo";
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
import ReactMarkdown from "react-markdown";

// ─── Math & Geospatial Helpers ─────────────────────────────────────────
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const la1 = (a[1] * Math.PI) / 180;
  const la2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function polygonArea(ring: number[][]): number {
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

// ─── Chart Specifications ─────────────────────────────────────────────
export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  titleAr?: string;
  unit?: string;
  data: { name: string; value: number }[];
}

const CHART_COLORS = ["#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

// ─── Alert / Activity Types ───────────────────────────────────────────
export interface MapAlert {
  id: string;
  title: string;
  titleAr: string;
  category:
    | "flood"
    | "construction"
    | "encroachment"
    | "thermal"
    | "traffic"
    | "vegetation"
    | "sinkhole"
    | "airquality"
    | "energy"
    | "waste"
    | "metro"
    | "structural";
  severity: "critical" | "warning" | "info";
  lon: number;
  lat: number;
  district: string;
  districtAr: string;
  time: string;
  confidence: number;
  description: string;
  descriptionAr: string;
  recommendation: string;
  recommendationAr: string;
  chart: ChartSpec;
}

// Live real-world alerts positioned at verified coordinates in Riyadh (Total 12 Active Incidents)
const LIVE_ALERTS: MapAlert[] = [
  {
    id: "alert-003",
    title: "Critical Flash Flood & Standing Water Hazard",
    titleAr: "تجمع مياه سطحي وخطر سيول حرج",
    category: "flood",
    severity: "critical",
    lon: 46.656,
    lat: 24.641,
    district: "Ash Shemaysi",
    districtAr: "الشميسي",
    time: "15m ago",
    confidence: 0.98,
    description:
      "Hydrological surface sensor network and radar imagery identified severe standing water depth exceeding 48cm blocking the Shemaysi logistical service yard.",
    descriptionAr:
      "رصدت شبكة الحساسات الهيدرولوجية ورادار الأمطار تجمع مياه بارتفاع يتجاوز 48 سم يعيق ساحة الخدمات اللوجستية بحي الشميسي.",
    recommendation:
      "Activate municipal emergency drainage units and notify the Civil Defense operations room.",
    recommendationAr:
      "تفعيل صهاريج ومضخات الطوارئ البلدية وإشعار غرفة عمليات الدفاع المدني فوراً.",
    chart: {
      type: "line",
      title: "Hourly Flood Depth Telemetry (cm)",
      titleAr: "قياس منسوب المياه السطحية بالساعة (سم)",
      unit: "cm",
      data: [
        { name: "03:00", value: 4 },
        { name: "04:30", value: 12 },
        { name: "06:00", value: 24 },
        { name: "07:00", value: 37 },
        { name: "08:15", value: 48 },
      ],
    },
  },
  {
    id: "alert-005",
    title: "Unauthorized Earthwork & Construction",
    titleAr: "حفريات غير مصرح بها وأعمال إنشائية",
    category: "construction",
    severity: "warning",
    lon: 46.688,
    lat: 24.732,
    district: "Al Olaya",
    districtAr: "العليا",
    time: "28m ago",
    confidence: 0.94,
    description:
      "High-resolution satellite imagery detected unauthorized earthworks and heavy machinery operating without active MOMRAH municipal permit.",
    descriptionAr:
      "رصدت صور الأقمار الصناعية عالية الدقة أعمال حفر غير مصرح بها ومعدات بناء تعمل دون رخصة بلدية سارية من أمانة الرياض.",
    recommendation:
      "Dispatch field inspection team from Al Olaya municipality branch and issue an electronic stop-work order.",
    recommendationAr:
      "توجيه فرقة تفتيش ميدانية من بلدية العليا وإصدار إشعار إيقاف أعمال إلكتروني فوري.",
    chart: {
      type: "bar",
      title: "Displaced Excavation Volume (m³ / day)",
      titleAr: "حجم الأتربة المحفورة غير المرخصة (م³ / يوم)",
      unit: "m³",
      data: [
        { name: "Day 1", value: 180 },
        { name: "Day 2", value: 410 },
        { name: "Day 3", value: 780 },
        { name: "Day 4", value: 1250 },
      ],
    },
  },
  {
    id: "alert-004",
    title: "Right-of-Way (ROW) Boundary Encroachment",
    titleAr: "تعدٍ على خط تنظيم وحرم الطريق العام",
    category: "encroachment",
    severity: "warning",
    lon: 46.642,
    lat: 24.802,
    district: "Al Malqa",
    districtAr: "الملقا",
    time: "42m ago",
    confidence: 0.84,
    description:
      "Perimeter fencing and storage containers erected 3.2 meters past the approved property line into the public right-of-way.",
    descriptionAr:
      "إقامة سياج مؤقت وحاويات تخزين تتجاوز خط التنظيم المعتمد بـ 3.2 متر داخل حرم الطريق العام بممر الملقا التجاري.",
    recommendation:
      "Issue 48-hour compliance violation via Balady platform and mandate physical setback.",
    recommendationAr:
      "إصدار إشعار مخالفة بمهلة 48 ساعة عبر منصة بلدي وإلزام المالك بالارتداد الفوري.",
    chart: {
      type: "bar",
      title: "Boundary Encroachment Setback (Meters)",
      titleAr: "مسافة التعدي على حرم الشارع (أمتار)",
      unit: "m",
      data: [
        { name: "Permitted", value: 0 },
        { name: "Fence", value: 1.4 },
        { name: "Storage", value: 2.5 },
        { name: "Max Violation", value: 3.2 },
      ],
    },
  },
  {
    id: "alert-002",
    title: "Severe Thermal Anomaly at Industrial Facility",
    titleAr: "شذوذ حراري حرج بمنشأة صناعية",
    category: "thermal",
    severity: "critical",
    lon: 46.72,
    lat: 24.615,
    district: "South Industrial District",
    districtAr: "المدينة الصناعية الجنوبية",
    time: "1h ago",
    confidence: 0.96,
    description:
      "MODIS & thermal infrared sensors recorded an anomalous surface heat spike of 84°C indicating unventilated flare or material combustion.",
    descriptionAr:
      "رصدت الحساسات الحرارية بالأشعة تحت الحمراء ارتفاعاً حرارياً مفاجئاً إلى 84 درجة مئوية يشير إلى احتراق مواد غير منضبط.",
    recommendation:
      "Dispatch MODON industrial safety patrol and cross-reference real-time atmospheric emissions data.",
    recommendationAr:
      "إرسال دورية السلامة الصناعية من مدن والتحقق من قياسات الانبعاثات البيئية الفورية.",
    chart: {
      type: "line",
      title: "Surface Temperature Telemetry (°C)",
      titleAr: "قراءات درجة الحرارة السطحية (°م)",
      unit: "°C",
      data: [
        { name: "01:00", value: 28 },
        { name: "03:00", value: 32 },
        { name: "04:30", value: 46 },
        { name: "05:45", value: 68 },
        { name: "07:00", value: 84 },
      ],
    },
  },
  {
    id: "alert-006",
    title: "Major Asphalt Rutting & Traffic Obstruction",
    titleAr: "هبوط إسفلتي وحادث مروري بالطريق الدائري",
    category: "traffic",
    severity: "warning",
    lon: 46.73,
    lat: 24.79,
    district: "Northern Ring Road (J3)",
    districtAr: "الطريق الدائري الشمالي (مخرج 3)",
    time: "2h ago",
    confidence: 0.89,
    description:
      "LiDAR road profiler detected 8.5cm pavement depression causing secondary lane obstruction and heavy localized traffic congestion.",
    descriptionAr:
      "رصدت كاميرات المراقبة وتحليل الليزر هبوطاً إسفلتياً بعمق 8.5 سم تسبب في إغلاق مسار فرعي وتباطؤ حركة المرور.",
    recommendation:
      "Dispatch rapid pavement repair contractor and coordinate traffic diversion with Riyadh Traffic Police.",
    recommendationAr:
      "توجيه مقاول الصيانة السريعة والتنسيق مع مرور منطقة الرياض لتحويل مسار الحركة.",
    chart: {
      type: "bar",
      title: "Lane Speed vs Normal Flow (km/h)",
      titleAr: "انخفاض سرعة الطريق مقارنة بالمعدل الطبيعي (كم/س)",
      unit: "km/h",
      data: [
        { name: "Speed Limit", value: 120 },
        { name: "Normal Peak", value: 85 },
        { name: "Current Flow", value: 28 },
      ],
    },
  },
  {
    id: "alert-001",
    title: "Vegetation Canopy Loss in Public Sector",
    titleAr: "فقدان غطاء نباتي بالحديقة العامة",
    category: "vegetation",
    severity: "info",
    lon: 46.695,
    lat: 24.73,
    district: "King Fahd District Park",
    districtAr: "حديقة حي الملك فهد",
    time: "3h ago",
    confidence: 0.77,
    description:
      "Automated multispectral NDVI index dropped by 34% over a 1,200m² sector following an irrigation mainline valve rupture.",
    descriptionAr:
      "انخفاض مؤشر الغطاء النباتي (NDVI) بنسبة 34% على مساحة 1200 م² نتيجة انقطاع في شبكة الري الآلية.",
    recommendation:
      "Trigger maintenance ticket for Parks Directorate irrigation technician team.",
    recommendationAr:
      "إصدار تذكرة صيانة لإدارة التشغيل والحدائق لإصلاح خطوط الري واستعادة المسطحات.",
    chart: {
      type: "line",
      title: "NDVI Green Canopy Health Index (%)",
      titleAr: "مؤشر صحة الغطاء النباتي (NDVI %)",
      unit: "%",
      data: [
        { name: "Jun", value: 86 },
        { name: "Jul", value: 83 },
        { name: "Aug", value: 76 },
        { name: "Sep", value: 48 },
      ],
    },
  },
  {
    id: "alert-007",
    title: "Groundwater Seepage & Geotechnical Subsidence Hazard",
    titleAr: "تغلغل مياه جوفية وخطر هبوط أرضي جيوتقني",
    category: "sinkhole",
    severity: "critical",
    lon: 46.577,
    lat: 24.735,
    district: "Historical Diriyah Buffer",
    districtAr: "نطاق الدرعية التاريخية",
    time: "35m ago",
    confidence: 0.95,
    description:
      "Subsurface InSAR ground deformation radar and moisture probes detected 18mm localized subsidence and subterranean pooling threatening historical mudbrick structures.",
    descriptionAr:
      "رصدت مجسات قياس الهبوط الراداري (InSAR) ورطوبة التربة هبوطاً موضعياً بمقدار 18 ملم يهدد استقرار الأساسات التراثية بالدرعية.",
    recommendation:
      "Issue immediate structural preservation alert to Diriyah Gate Development Authority (DGDA) and deploy geotechnical grouting crew.",
    recommendationAr:
      "إصدار تنبيه حماية إنشائية فوري لهيئة تطوير بوابة الدرعية وتوجيه فريق حقن التربة الهندسي.",
    chart: {
      type: "line",
      title: "Subsurface Ground Subsidence (mm / month)",
      titleAr: "معدل الهبوط الأرضي التراكمي (ملم / شهر)",
      unit: "mm",
      data: [
        { name: "M-1", value: 2 },
        { name: "M-2", value: 5 },
        { name: "M-3", value: 9 },
        { name: "M-4", value: 14 },
        { name: "Current", value: 18 },
      ],
    },
  },
  {
    id: "alert-008",
    title: "Airborne Particulate PM10 Dust Surge",
    titleAr: "ارتفاع حاد في جسيمات الغبار العالقة PM10",
    category: "airquality",
    severity: "warning",
    lon: 46.702,
    lat: 24.954,
    district: "Airport Aviation Corridor",
    districtAr: "ممر مطار الملك خالد الدولي",
    time: "50m ago",
    confidence: 0.91,
    description:
      "Optical LiDAR and air quality station AP-04 recorded PM10 particulate levels of 245 µg/m³ driven by northeastern winds and unpaved perimeter staging.",
    descriptionAr:
      "سجلت محطة الرصد البيئي AP-04 تركيز غبار PM10 بلغ 245 ميكروغرام/م³ بسبب الرياح الشمالية ونشاط مشاريع لوجستية غير مرشوشة بالمياه.",
    recommendation:
      "Mandate automated chemical dust suppressant sprayers on surrounding project contractors and issue aviation advisory.",
    recommendationAr:
      "إلزام مقاولي المشاريع المحيطة بتشغيل أنظمة رش مثبتات الغبار وإصدار إشعار استباقي لإدارة المطار.",
    chart: {
      type: "bar",
      title: "Airborne Particulate Concentration (µg/m³)",
      titleAr: "تركيز الغبار العالق مقارنة بالمعايير البيئية (ميكروغرام/م³)",
      unit: "µg/m³",
      data: [
        { name: "WHO Standard", value: 45 },
        { name: "Saudi PME Limit", value: 80 },
        { name: "Yesterday", value: 110 },
        { name: "Peak Alert", value: 245 },
      ],
    },
  },
  {
    id: "alert-009",
    title: "Substation Transformer Thermal Overload",
    titleAr: "إجهاد حراري بمحول محطة التوزيع الكهربائي",
    category: "energy",
    severity: "warning",
    lon: 46.662,
    lat: 24.768,
    district: "KAFD Energy District",
    districtAr: "مركز الملك عبدالله المالي (كافد)",
    time: "1h 15m ago",
    confidence: 0.93,
    description:
      "SCADA telemetry and satellite thermal cameras identified a 92°C hotspot on Step-Down Transformer T-2 at KAFD Main Substation under 94% peak load.",
    descriptionAr:
      "رصدت أنظمة سكادا والقمر الصناعي الحراري بؤرة ساخنة بحرارة 92 درجة مئوية على المحول T-2 بمحطة تحويل كافد تحت حمل استهلاك مرتفع.",
    recommendation:
      "Coordinate load shedding with Saudi Electricity Company (SEC) and dispatch auxiliary mobile liquid nitrogen cooling unit.",
    recommendationAr:
      "التنسيق مع مركز التحكم بالشركة السعودية للكهرباء لإعادة موازنة الحمل وتوجيه صهريج التبريد السريع للمحطة.",
    chart: {
      type: "line",
      title: "Transformer Core Temperature (°C)",
      titleAr: "درجة حرارة قلب المحول مقابل سقف الأمان (°م)",
      unit: "°C",
      data: [
        { name: "10:00", value: 62 },
        { name: "12:00", value: 74 },
        { name: "14:00", value: 85 },
        { name: "15:30", value: 92 },
      ],
    },
  },
  {
    id: "alert-010",
    title: "Unpermitted Hazardous Waste Dumping Site",
    titleAr: "موقع تفريغ مخلفات خطرة غير مرخص",
    category: "waste",
    severity: "critical",
    lon: 46.775,
    lat: 24.582,
    district: "Al Aziziyah Logistics Perimeter",
    districtAr: "محيط العزيزية اللوجستي",
    time: "1h 40m ago",
    confidence: 0.97,
    description:
      "Drone surveillance imagery identified illegal commercial dump trucks discarding 420 tons of construction debris and petrochemical polymers on unzoned desert land.",
    descriptionAr:
      "رصدت طائرات الاستطلاع المسيرة شاحنات تلقي 420 طناً من مخلفات الهدم وبوليمرات صناعية في أرض فضاء غير مخصصة جنوب الرياض.",
    recommendation:
      "Issue automated Balady smart plate citations, notify Riyadh Environmental Police, and mandate immediate hazardous site remediation.",
    recommendationAr:
      "إصدار مخالفات فورية عبر كاميرات الرصد الذكية لمركبات النقل وإشعار القوات الخاصة للأمن البيئي لتطهير الموقع.",
    chart: {
      type: "bar",
      title: "Dumped Debris Volume by Category (Tons)",
      titleAr: "حجم المخلفات المرصودة حسب النوع (طن)",
      unit: "Tons",
      data: [
        { name: "Concrete", value: 210 },
        { name: "Asphalt Scrap", value: 120 },
        { name: "Industrial Poly", value: 65 },
        { name: "Domestic Mix", value: 25 },
      ],
    },
  },
  {
    id: "alert-011",
    title: "Riyadh Metro Line 3 Track Perimeter Intrusion",
    titleAr: "اختراق المحيط الأمني لمسار قطار الرياض (الخط 3)",
    category: "metro",
    severity: "critical",
    lon: 46.722,
    lat: 24.646,
    district: "Al Batha Central Transit",
    districtAr: "مركز البطحاء للنقل العام",
    time: "2h 10m ago",
    confidence: 0.99,
    description:
      "AI CCTV fence monitoring detected human breach and metal scaffolding encroaching within 1.8m of the 750V third-rail electrified metro track.",
    descriptionAr:
      "رصدت كاميرات الذكاء الاصطناعي اختراقاً للمحيط الأمني وسقالة حديدية على مسافة 1.8 متر من سكة القطار الكهربائية عالية الجهد.",
    recommendation:
      "Transmit automated slow-order (20 km/h) to approaching Trainset #308 and dispatch Royal Commission for Riyadh City (RCRC) security.",
    recommendationAr:
      "إرسال أمر تهدئة آلي (20 كم/س) للقطار القادم رقم 308 وتوجيه دوريات أمن النقل التابعة للهيئة الملكية لمدينة الرياض.",
    chart: {
      type: "bar",
      title: "Obstacle Distance from Electrified Rail (Meters)",
      titleAr: "مسافة العائق من السكة المكهربة مقابل حاجز الأمان (متر)",
      unit: "m",
      data: [
        { name: "Safety Buffer", value: 5.0 },
        { name: "Warning Line", value: 3.0 },
        { name: "Intrusion Point", value: 1.8 },
      ],
    },
  },
  {
    id: "alert-012",
    title: "Sky Bridge Dynamic Vibration & Wind Shear Load",
    titleAr: "اهتزازات ديناميكية وهبوب رياح بجسر المملكة المعلق",
    category: "structural",
    severity: "info",
    lon: 46.6744,
    lat: 24.7114,
    district: "Al Olaya Commercial Axis",
    districtAr: "محور العليا التجاري",
    time: "2h 45m ago",
    confidence: 0.88,
    description:
      "Structural health fiber-optic accelerometers measured 1.42 Hz micro-vibrations during 54 km/h high-altitude gusts at the 300m Kingdom Tower Sky Bridge.",
    descriptionAr:
      "سجلت حساسات الألياف الضوئية الإنشائية اهتزازات طفيفة بتردد 1.42 هرتز خلال هبات رياح علوية بلغت 54 كم/س بجسر برج المملكة.",
    recommendation:
      "Automated tuned mass dampers (TMD) verified stabilizing properly; continue sensor logging without visitor capacity restrictions.",
    recommendationAr:
      "التأكد من تشغيل مخمدات الكتلة الآلية (TMD) بنجاح والاستمرار في تسجيل البيانات دون الحاجة لإجراءات إخلاء.",
    chart: {
      type: "line",
      title: "Structural Oscillation Frequency (Hz)",
      titleAr: "تردد اهتزاز الهيكل المعدني بالهرتز",
      unit: "Hz",
      data: [
        { name: "T-40m", value: 0.4 },
        { name: "T-30m", value: 0.8 },
        { name: "T-20m", value: 1.1 },
        { name: "T-10m", value: 1.42 },
        { name: "Now", value: 1.15 },
      ],
    },
  },
];

// ─── Real Basemap Specifications ──────────────────────────────────────
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
  topo: {
    name: "Topo",
    nameAr: "تضاريس",
    spec: {
      version: 8,
      sources: {
        "esri-topo": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri World Topo",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "topo-layer",
          type: "raster",
          source: "esri-topo",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    } as maplibregl.StyleSpecification,
  },
};

type Tool = "pan" | "select" | "measure" | "draw";
type BasemapKey = keyof typeof BASEMAPS;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartSpec | null;
  alertRef?: MapAlert | null;
  timestamp: string;
}

export function MapWorkspace() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  // Tools & Basemap State
  const [tool, setTool] = React.useState<Tool>("pan");
  const [basemap, setBasemap] = React.useState<BasemapKey>("streets");
  const [showPOIs, setShowPOIs] = React.useState(true);
  const [showAlerts, setShowAlerts] = React.useState(true);
  const [alertSeverityFilter, setAlertSeverityFilter] = React.useState<"all" | "critical" | "warning" | "info">("all");
  const [envHudOpen, setEnvHudOpen] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState("");

  // Floating UI toggles
  const [leftPanelOpen, setLeftPanelOpen] = React.useState(true);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(false);
  const [chatbotOpen, setChatbotOpen] = React.useState(true);
  const [chatWidth, setChatWidth] = React.useState<number>(420);
  const [isMaximized, setIsMaximized] = React.useState<boolean>(false);
  const [showPromptChips, setShowPromptChips] = React.useState<boolean>(true);
  const isDraggingRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(420);

  // Drag-to-resize width handler
  const startResize = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      startXRef.current = e.clientX;
      startWidthRef.current = chatWidth;

      const onMouseMove = (ev: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const delta =
          lang === "ar"
            ? ev.clientX - startXRef.current
            : startXRef.current - ev.clientX;
        const newW = Math.min(
          Math.max(startWidthRef.current + delta, 360),
          Math.min(window.innerWidth - 40, 1000)
        );
        setChatWidth(newW);
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [chatWidth, lang]
  );

  // Map state
  const [zoomLevel, setZoomLevel] = React.useState<number>(12);
  const [coords, setCoords] = React.useState({
    lon: RIYADH_CENTER.lon,
    lat: RIYADH_CENTER.lat,
  });

  // Selected Alert or Clicked Location
  const [selectedAlert, setSelectedAlert] = React.useState<MapAlert | null>(null);
  const [clickedLocation, setClickedLocation] = React.useState<{
    title: string;
    subtitle: string;
    lon: number;
    lat: number;
  } | null>(null);

  // Measuring & Drawing state
  const [measurePoints, setMeasurePoints] = React.useState<[number, number][]>([]);
  const [drawPoints, setDrawPoints] = React.useState<[number, number][]>([]);

  // Chatbot State
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "m-welcome",
      role: "assistant",
      content:
        lang === "ar"
          ? "مرحباً بك في **مساعد جيو وايز الجيومكاني الذكي** 🛰️.\n\nأنا متصل مباشرة بنموذج **Mistral AI** مع إمكانية الوصول إلى كافة بيانات الرصد الجيومكاني لمدينة الرياض (التنبيهات الحية، محطات الرصد، وأسراب الطائرات المسيرة).\n\nاسألني عن أي موقع، تنبيه، أو مؤشر بيئي وسأجيبك بذكاء وديناميكية فورية."
          : "Welcome to **GeoWise AI Copilot** 🛰️.\n\nConnected directly to **Mistral AI** with real-time access to Riyadh's geospatial intelligence.\n\nAsk me any question about any location, alert, environmental sensor, or municipal analysis, and I'll analyze it dynamically.",
      timestamp: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = React.useState("");
  const [isChatLoading, setIsChatLoading] = React.useState(false);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const alertMarkersRef = React.useRef<maplibregl.Marker[]>([]);
  const clickMarkerRef = React.useRef<maplibregl.Marker | null>(null);
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll to show latest message briefing cleanly without cutting top content off
  React.useEffect(() => {
    if (chatScrollRef.current) {
      const container = chatScrollRef.current;
      const items = container.querySelectorAll(".chat-bubble-entry");
      const lastItem = items[items.length - 1] as HTMLElement | undefined;
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, isChatLoading]);

  // Synchronize initial welcome message immediately when user toggles site language (EN <-> AR)
  React.useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === "m-welcome") {
        return [
          {
            id: "m-welcome",
            role: "assistant",
            content:
              lang === "ar"
                ? "مرحباً بك في **مساعد جيو وايز الجيومكاني الذكي** 🛰️.\n\nأنا متصل مباشرة بنموذج **Mistral AI** مع إمكانية الوصول إلى كافة بيانات الرصد الجيومكاني لمدينة الرياض (التنبيهات الحية، محطات الرصد، وأسراب الطائرات المسيرة).\n\nاسألني عن أي موقع، تنبيه، أو مؤشر بيئي وسأجيبك بذكاء وديناميكية فورية."
                : "Welcome to **GeoWise AI Copilot** 🛰️.\n\nConnected directly to **Mistral AI** with real-time access to Riyadh's geospatial intelligence.\n\nAsk me any question about any location, alert, environmental sensor, or municipal analysis, and I'll analyze it dynamically in English.",
            timestamp: "Just now",
          },
        ];
      }
      return prev;
    });
  }, [lang]);

  // Live measurements
  const measureDistance = React.useMemo(() => {
    if (measurePoints.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < measurePoints.length; i++) {
      total += haversine(measurePoints[i - 1], measurePoints[i]);
    }
    return total;
  }, [measurePoints]);

  const drawArea = React.useMemo(() => {
    if (drawPoints.length < 3) return 0;
    return polygonArea([...drawPoints, drawPoints[0]]);
  }, [drawPoints]);

  // Trigger Chatbot Explanation with Visualization via dynamic Mistral AI
  const explainAlertWithChatbot = React.useCallback(
    (alert: MapAlert) => {
      setSelectedAlert(alert);
      setRightPanelOpen(true);
      setChatbotOpen(true);

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [alert.lon, alert.lat],
          zoom: 15.5,
          duration: 1200,
          essential: true,
        });
      }

      const alertName = lang === "ar" ? alert.titleAr : alert.title;
      const districtName = lang === "ar" ? alert.districtAr : alert.district;

      const userPrompt =
        lang === "ar"
          ? `قدم لي تحليلاً للتنبيه [${alert.id}]: ${alertName} في ${districtName}`
          : `Provide an intelligence briefing for alert [${alert.id}]: ${alertName} in ${districtName}`;

      handleSendMessage(undefined, userPrompt);
    },
    [lang]
  );

  // Attach POIs & custom draw/measure layers
  const attachMapSources = React.useCallback(
    (map: maplibregl.Map) => {
      // 1. POIs Layer
      if (!map.getSource("pois-source")) {
        const poisGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Point> = {
          type: "FeatureCollection",
          features: POIS.map((p) => ({
            type: "Feature",
            id: p.id,
            geometry: p.geometry as GeoJSON.Point,
            properties: {
              id: p.id,
              name: p.name,
              nameAr: p.nameAr,
              subtype: p.subtype,
              color: "#0284c7",
              ...p.properties,
            },
          })),
        };

        map.addSource("pois-source", { type: "geojson", data: poisGeoJSON });

        map.addLayer({
          id: "pois-circle",
          type: "circle",
          source: "pois-source",
          paint: {
            "circle-radius": 5.5,
            "circle-color": "#0ea5e9",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }

      // 2. Measure Layer
      if (!map.getSource("measure-source")) {
        map.addSource("measure-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "measure-line",
          type: "line",
          source: "measure-source",
          paint: { "line-color": "#f59e0b", "line-width": 3, "line-dasharray": [3, 2] },
        });
        map.addLayer({
          id: "measure-pts",
          type: "circle",
          source: "measure-source",
          paint: { "circle-radius": 5, "circle-color": "#f59e0b", "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" },
        });
      }

      // 3. Draw Layer
      if (!map.getSource("draw-source")) {
        map.addSource("draw-source", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "draw-fill",
          type: "fill",
          source: "draw-source",
          paint: { "fill-color": "#06b6d4", "fill-opacity": 0.25 },
        });
        map.addLayer({
          id: "draw-line",
          type: "line",
          source: "draw-source",
          paint: { "line-color": "#0891b2", "line-width": 2.5 },
        });
        map.addLayer({
          id: "draw-pts",
          type: "circle",
          source: "draw-source",
          paint: { "circle-radius": 5, "circle-color": "#0891b2", "circle-stroke-width": 2, "circle-stroke-color": "#ffffff" },
        });
      }

      // 4. Render Live Animated Pulsing Radar Markers for Alerts
      alertMarkersRef.current.forEach((m) => m.remove());
      alertMarkersRef.current = [];

      LIVE_ALERTS.forEach((al) => {
        const isCritical = al.severity === "critical";
        const isWarning = al.severity === "warning";

        const el = document.createElement("div");
        el.className = "alert-marker-wrap relative cursor-pointer group flex items-center justify-center";
        el.style.width = "44px";
        el.style.height = "44px";
        el.setAttribute("data-severity", al.severity);

        const iconSymbol =
          al.category === "flood"
            ? "💧"
            : al.category === "thermal"
              ? "🔥"
              : al.category === "traffic"
                ? "🚗"
                : al.category === "vegetation"
                  ? "🌳"
                  : al.category === "sinkhole"
                    ? "🕳️"
                    : al.category === "airquality"
                      ? "🌫️"
                      : al.category === "energy"
                        ? "⚡"
                        : al.category === "waste"
                          ? "🚛"
                          : al.category === "metro"
                            ? "🚇"
                            : al.category === "structural"
                              ? "🏗️"
                              : "⚠️";

        const pingColor = isCritical
          ? "bg-rose-500/40"
          : isWarning
            ? "bg-amber-500/40"
            : "bg-sky-500/40";

        const badgeGradient = isCritical
          ? "bg-gradient-to-tr from-rose-600 to-rose-500 text-white shadow-xl shadow-rose-600/50"
          : isWarning
            ? "bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/50"
            : "bg-gradient-to-tr from-sky-500 to-sky-400 text-white shadow-xl shadow-sky-500/50";

        el.innerHTML = `
          <div class="absolute inset-0 rounded-full ${pingColor} animate-ping"></div>
          <div class="relative z-10 size-9 rounded-full ${badgeGradient} flex items-center justify-center border-2 border-white font-extrabold text-xs transition-transform transform group-hover:scale-125">
            ${iconSymbol}
          </div>
          <div class="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50">
            <div class="bg-slate-900/95 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-2xl border border-white/20 backdrop-blur">
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full ${isCritical ? "bg-rose-500" : isWarning ? "bg-amber-400" : "bg-sky-400"} animate-pulse"></span>
                <span>${lang === "ar" ? al.titleAr : al.title}</span>
              </div>
              <div class="text-[9px] text-primary font-normal mt-0.5">Click for AI briefing & telemetry chart</div>
            </div>
          </div>
        `;

        el.addEventListener("click", (e) => {
          e.stopPropagation();
          map.flyTo({
            center: [al.lon, al.lat],
            zoom: 15.5,
            duration: 1200,
            essential: true,
          });
          explainAlertWithChatbot(al);
        });

        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat([al.lon, al.lat])
          .addTo(map);

        alertMarkersRef.current.push(marker);
      });
    },
    [lang, explainAlertWithChatbot]
  );

  // Initialize MapLibre
  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    if (typeof window !== "undefined") {
      try {
        const workerUrl = `${window.location.origin}/maplibre/maplibre-gl-worker.mjs`;
        maplibregl.setWorkerUrl(workerUrl);
      } catch (e) {
        console.warn("Could not set worker url", e);
      }
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: BASEMAPS.streets.spec,
      center: [RIYADH_CENTER.lon, RIYADH_CENTER.lat],
      zoom: 12.2,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.ScaleControl({ maxWidth: 100, unit: "metric" }),
      "bottom-left"
    );

    map.on("load", () => {
      attachMapSources(map);
    });

    map.on("mousemove", (e) => {
      setCoords({ lon: e.lngLat.lng, lat: e.lngLat.lat });
    });

    map.on("zoom", () => {
      setZoomLevel(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      alertMarkersRef.current.forEach((m) => m.remove());
      alertMarkersRef.current = [];
      if (clickMarkerRef.current) clickMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [attachMapSources]);

  // Basemap switch
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(BASEMAPS[basemap].spec);
    map.once("style.load", () => {
      attachMapSources(map);
    });
  }, [basemap, attachMapSources]);

  // Toggle POIs & Alert visibility
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer("pois-circle")) {
      map.setLayoutProperty("pois-circle", "visibility", showPOIs ? "visible" : "none");
    }

    alertMarkersRef.current.forEach((m) => {
      const el = m.getElement();
      const sev = el.getAttribute("data-severity");
      const matchesFilter =
        alertSeverityFilter === "all" || sev === alertSeverityFilter;
      el.style.display = showAlerts && matchesFilter ? "flex" : "none";
    });
  }, [showPOIs, showAlerts, alertSeverityFilter]);

  // Handle map click
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: maplibregl.MapMouseEvent) => {
      const coord: [number, number] = [e.lngLat.lng, e.lngLat.lat];

      if (tool === "measure") {
        setMeasurePoints((prev) => [...prev, coord]);
        return;
      }

      if (tool === "draw") {
        setDrawPoints((prev) => [...prev, coord]);
        return;
      }

      // Drop inspection pin
      if (clickMarkerRef.current) {
        clickMarkerRef.current.remove();
      }

      const el = document.createElement("div");
      el.className = "size-7 flex items-center justify-center text-teal-400 drop-shadow-xl animate-bounce pointer-events-none";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

      clickMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat(coord)
        .addTo(map);

      setSelectedAlert(null);
      setClickedLocation({
        title: lang === "ar" ? "نقطة فحص جيومكانية" : "Inspected Map Coordinate",
        subtitle: `${coord[0].toFixed(5)}° E, ${coord[1].toFixed(5)}° N`,
        lon: coord[0],
        lat: coord[1],
      });
      setRightPanelOpen(true);
    };

    map.on("click", handleMapClick);

    const canvas = map.getCanvas();
    if (tool === "pan") {
      canvas.style.cursor = "grab";
    } else if (tool === "select") {
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "crosshair";
    }

    return () => {
      map.off("click", handleMapClick);
    };
  }, [tool, lang]);

  // Sync measure points GeoJSON
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("measure-source") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (measurePoints.length === 0) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const features: GeoJSON.Feature[] = [
      {
        type: "Feature",
        geometry: { type: "LineString", coordinates: measurePoints },
        properties: {},
      },
      ...measurePoints.map(
        (pt) =>
          ({
            type: "Feature",
            geometry: { type: "Point", coordinates: pt },
            properties: {},
          }) as GeoJSON.Feature
      ),
    ];
    source.setData({ type: "FeatureCollection", features });
  }, [measurePoints]);

  // Sync draw points GeoJSON
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource("draw-source") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (drawPoints.length === 0) {
      source.setData({ type: "FeatureCollection", features: [] });
      return;
    }

    const closedRing = drawPoints.length >= 3 ? [...drawPoints, drawPoints[0]] : drawPoints;

    const features: GeoJSON.Feature[] = [
      drawPoints.length >= 3
        ? {
            type: "Feature",
            geometry: { type: "Polygon", coordinates: [closedRing] },
            properties: {},
          }
        : {
            type: "Feature",
            geometry: { type: "LineString", coordinates: drawPoints },
            properties: {},
          },
      ...drawPoints.map(
        (pt) =>
          ({
            type: "Feature",
            geometry: { type: "Point", coordinates: pt },
            properties: {},
          }) as GeoJSON.Feature
      ),
    ];
    source.setData({ type: "FeatureCollection", features });
  }, [drawPoints]);

  // Match location coordinates for camera flyTo
  const findMapTargetLocation = (q: string): {
    targetCoord?: { lon: number; lat: number; zoom: number };
    alertRef?: MapAlert | null;
  } | null => {
    const lower = q.toLowerCase();

    // 1. Check for specific live alerts
    const alertKeywords: Record<string, string[]> = {
      "alert-007": ["sinkhole", "diriyah", "subsidence", "seepage", "درعية", "007"],
      "alert-008": ["dust", "airport", "aviation", "pm10", "مطار", "غبار", "008"],
      "alert-009": ["substation", "transformer", "kafd", "كافد", "محول", "009"],
      "alert-010": ["waste", "dumping", "aziziyah", "عزيزية", "مخلفات", "010"],
      "alert-011": ["metro", "track", "rail", "batha", "بطحاء", "مترو", "011"],
      "alert-012": ["kingdom", "vibration", "sky bridge", "مملكة", "012"],
      "alert-003": ["flood", "water", "shemaysi", "شميسي", "سيول", "003"],
      "alert-005": ["excavation", "olaya", "عليا", "حفر", "005"],
      "alert-004": ["encroachment", "row", "malqa", "ملقا", "تعدي", "004"],
      "alert-002": ["thermal", "heat", "industrial", "صناعية", "002"],
      "alert-006": ["traffic", "ring road", "دائري", "006"],
      "alert-001": ["vegetation", "canopy", "park", "حديقة", "أشجار", "001"],
    };

    for (const [alertId, keywords] of Object.entries(alertKeywords)) {
      if (keywords.some((k) => lower.includes(k))) {
        const alert = LIVE_ALERTS.find((a) => a.id === alertId);
        if (alert) {
          return {
            targetCoord: { lon: alert.lon, lat: alert.lat, zoom: 15.5 },
            alertRef: alert,
          };
        }
      }
    }

    // 2. Weather / Environmental station
    if (lower.includes("weather") || lower.includes("aqi") || lower.includes("طقس") || lower.includes("بيئة")) {
      return {
        targetCoord: { lon: RIYADH_CENTER.lon, lat: RIYADH_CENTER.lat, zoom: 12 },
      };
    }

    // 3. Drone fleet
    if (lower.includes("drone") || lower.includes("uav") || lower.includes("درون") || lower.includes("مسير")) {
      return {
        targetCoord: { lon: 46.685, lat: 24.75, zoom: 13.5 },
      };
    }

    return null;
  };

  // Handle Chatbot User Query via Mistral AI (100% Dynamic & Intelligent)
  const handleSendMessage = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const query = customPrompt || chatInput.trim();
    if (!query || isChatLoading) return;

    if (!customPrompt) setChatInput("");
    setChatbotOpen(true);

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);

    // Check if query refers to a location on the map and smoothly pan there
    const targetLoc = findMapTargetLocation(query);
    if (targetLoc) {
      if (targetLoc.alertRef) {
        setSelectedAlert(targetLoc.alertRef);
      }
      if (targetLoc.targetCoord && mapRef.current) {
        mapRef.current.flyTo({
          center: [targetLoc.targetCoord.lon, targetLoc.targetCoord.lat],
          zoom: targetLoc.targetCoord.zoom,
          duration: 1200,
          essential: true,
        });
      }
    }

    // Query Mistral AI Dynamically!
    setIsChatLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          lang,
          visualize: true,
          mapContext: {
            selectedAlertId: selectedAlert?.id || targetLoc?.alertRef?.id,
            center: mapRef.current ? [mapRef.current.getCenter().lng, mapRef.current.getCenter().lat] : undefined,
            zoom: mapRef.current ? mapRef.current.getZoom() : undefined,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Assistant request failed");
      }

      const data = await res.json();
      const detectedChart: ChartSpec | null = data.chart || targetLoc?.alertRef?.chart || null;

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply || (lang === "ar" ? "تمت معالجة الاستعلام الجيومكاني بنجاح." : "Geospatial query processed."),
          chart: detectedChart,
          alertRef: targetLoc?.alertRef || null,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch {
      // Natural Fallback if API is unreachable
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content:
            lang === "ar"
              ? "تعذر الاتصال بخادم الذكاء الاصطناعي مؤقتاً. يرجى التأكد من مفتاح Mistral API أو الاتصال بالشبكة."
              : "Unable to reach the Mistral AI service temporarily. Please verify your connection or API key.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Search Landmarks & Fly
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim() || !mapRef.current) return;

    const q = search.toLowerCase();
    const places = [
      { q: "olaya", name: "Al Olaya", lon: 46.685, lat: 24.713, zoom: 15 },
      { q: "kingdom", name: "Kingdom Centre", lon: 46.6744, lat: 24.7114, zoom: 15.5 },
      { q: "malqa", name: "Al Malqa", lon: 46.635, lat: 24.810, zoom: 14.5 },
      { q: "diriyah", name: "Historical Diriyah", lon: 46.575, lat: 24.733, zoom: 14.5 },
      { q: "shemaysi", name: "Ash Shemaysi", lon: 46.656, lat: 24.641, zoom: 15.5 },
      { q: "airport", name: "King Khalid Airport", lon: 46.699, lat: 24.957, zoom: 13 },
      { q: "riyadh", name: "Riyadh Center", lon: 46.6753, lat: 24.7136, zoom: 12 },
    ];

    const match = places.find((p) => q.includes(p.q) || p.name.toLowerCase().includes(q));
    if (match) {
      mapRef.current.flyTo({
        center: [match.lon, match.lat],
        zoom: match.zoom,
        duration: 1400,
        essential: true,
      });
      toast.success(`${match.name}`);
    } else {
      toast.info(lang === "ar" ? "جاري البحث..." : `Searching for "${search}"...`);
    }
  };

  const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
    { id: "pan", icon: Hand, label: t("map.pan") },
    { id: "select", icon: MousePointer, label: t("map.select") },
    { id: "measure", icon: Ruler, label: t("map.measure") },
    { id: "draw", icon: Pencil, label: t("map.draw") },
  ];

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden select-none bg-background">
      {/* ─── 100% FULL-PAGE MAP CANVAS ──────────────────────────────────── */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* ─── FLOATING TOP-LEFT HUD (Basemap, Tools, Layers) ─────────────── */}
      <div className="absolute top-3 start-3 z-20 flex flex-col gap-2 pointer-events-auto">
        {/* Header Capsule with Toggle */}
        <div className="h-10 px-3 flex items-center gap-2.5 bg-background/90 backdrop-blur-md border rounded-xl shadow-md">
          <div className="flex items-center gap-2 font-bold text-xs text-foreground">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold tracking-tight">GeoWise Map Workspace</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 ms-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            title={leftPanelOpen ? "Collapse Left Panel" : "Expand Left Panel"}
          >
            {leftPanelOpen ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>

        {/* Collapsible HUD Body */}
        {leftPanelOpen && (
          <Card className="w-72 max-h-[calc(100vh-130px)] overflow-y-auto bg-background/95 backdrop-blur-lg border rounded-xl shadow-2xl p-3 space-y-3.5 animate-in fade-in-50 duration-200">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={lang === "ar" ? "ابحث عن شارع أو معلم..." : "Search streets, landmarks..."}
                className="w-full ps-8 pe-3 py-1.5 text-xs rounded-lg bg-muted/60 border border-border/40 focus:border-primary focus:bg-background outline-none transition-all"
              />
            </form>

            {/* Basemap Selection */}
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>{t("map.basemap")}</span>
                <span className="text-[0.6rem] text-primary font-medium">real tiles</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(Object.keys(BASEMAPS) as BasemapKey[]).map((key) => {
                  const b = BASEMAPS[key];
                  const active = basemap === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setBasemap(key)}
                      className={cn(
                        "h-10 rounded-lg text-[0.68rem] font-semibold border-2 transition-all flex items-center justify-center capitalize",
                        active
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {lang === "ar" ? b.nameAr : b.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GIS Tools */}
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {t("map.tools")}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {tools.map((tl) => {
                  const Icon = tl.icon;
                  return (
                    <TooltipProvider key={tl.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => {
                              setTool(tl.id);
                              if (tl.id !== "measure") setMeasurePoints([]);
                              if (tl.id !== "draw") setDrawPoints([]);
                            }}
                            className={cn(
                              "h-9 rounded-lg flex flex-col items-center justify-center gap-0.5 border text-[0.65rem] font-medium transition-all",
                              tool === tl.id
                                ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                                : "bg-muted/40 hover:bg-muted border-transparent text-muted-foreground"
                            )}
                          >
                            <Icon className="size-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{tl.label}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>
            </div>

            {/* Live Activities & Layers */}
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center justify-between">
                <span>{lang === "ar" ? "طبقات الأنشطة الحية" : "Live Layers & Alerts"}</span>
                <Badge variant="destructive" className="h-4 px-1.5 text-[0.6rem] animate-pulse">
                  {LIVE_ALERTS.length} Alerts
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs">
                <div
                  onClick={() => setShowAlerts(!showAlerts)}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 cursor-pointer hover:bg-rose-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-semibold text-[0.72rem]">
                      {lang === "ar" ? "تنبيهات الأنشطة المباشرة" : "Live Activity Alerts"}
                    </span>
                  </div>
                  {showAlerts ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 opacity-60" />}
                </div>

                <div
                  onClick={() => setShowPOIs(!showPOIs)}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 cursor-pointer hover:bg-sky-500/15 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-sky-500" />
                    <span className="font-semibold text-[0.72rem]">
                      {lang === "ar" ? "معالم المدينة والبنية التحتية" : "City POIs & Landmarks"}
                    </span>
                  </div>
                  {showPOIs ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 opacity-60" />}
                </div>
              </div>
            </div>

            {/* Quick Bookmarks */}
            <div>
              <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t("map.bookmarks")}
              </div>
              <div className="grid grid-cols-2 gap-1 text-[0.65rem]">
                {[
                  { name: "Kingdom Tower", lon: 46.6744, lat: 24.7114, zoom: 15.5 },
                  { name: "Al Malqa ROW", lon: 46.642, lat: 24.802, zoom: 15 },
                  { name: "Diriyah Historic", lon: 46.575, lat: 24.733, zoom: 14.5 },
                  { name: "Shemaysi Flood", lon: 46.656, lat: 24.641, zoom: 15 },
                ].map((b) => (
                  <button
                    key={b.name}
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.flyTo({
                          center: [b.lon, b.lat],
                          zoom: b.zoom,
                          duration: 1400,
                          essential: true,
                        });
                      }
                      toast.success(`${b.name}`);
                    }}
                    className="p-1.5 rounded-md bg-muted/40 hover:bg-muted text-start truncate font-medium border border-transparent hover:border-border/40 transition-all"
                  >
                    📍 {b.name}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ─── TOP-RIGHT CONTROLS ─────────────────────────────────────────── */}
      <div className="absolute top-3 end-3 z-20 flex items-center gap-1.5 bg-background/90 backdrop-blur-md border rounded-xl shadow-md p-1 h-10 pointer-events-auto">
        {/* Toggle AI Chatbot Button */}
        <Button
          variant={chatbotOpen ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 gap-1.5 px-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all",
            chatbotOpen
              ? "bg-primary text-primary-foreground ring-1 ring-primary/30"
              : "bg-background/95 hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => setChatbotOpen(!chatbotOpen)}
        >
          <Bot className="size-4 text-emerald-400" />
          <span>GeoWise AI</span>
          <Badge variant="secondary" className="h-4 px-1 text-[0.6rem] ms-0.5">
            12
          </Badge>
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Zoom Controls */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomOut();
          }}
          title="Zoom Out"
        >
          <ZoomOut className="size-3.5" />
        </Button>

        <span className="text-[0.7rem] font-mono text-muted-foreground px-1 tabular-nums font-semibold">
          {Math.round((zoomLevel / 12) * 100)}%
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={() => {
            if (mapRef.current) mapRef.current.zoomIn();
          }}
          title="Zoom In"
        >
          <ZoomIn className="size-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Reset / Fly to Riyadh */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={() => {
            if (mapRef.current) {
              mapRef.current.flyTo({
                center: [RIYADH_CENTER.lon, RIYADH_CENTER.lat],
                zoom: 12.2,
                pitch: 0,
                bearing: 0,
                essential: true,
              });
              toast.success(lang === "ar" ? "تمت إعادة الضبط" : "Camera reset to Riyadh");
            }
          }}
          title="Reset Camera"
        >
          <Maximize2 className="size-3.5" />
        </Button>

        {/* Print / Snapshot */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={() => {
            if (!mapRef.current) return;
            try {
              const dataUrl = mapRef.current.getCanvas().toDataURL("image/png");
              const link = document.createElement("a");
              link.download = `geowise-map-${Date.now()}.png`;
              link.href = dataUrl;
              link.click();
              toast.success(lang === "ar" ? "تم حفظ لقطة الخريطة" : "Map snapshot exported");
            } catch {
              toast.info(lang === "ar" ? "تصدير الخريطة" : "Exporting map snapshot");
            }
          }}
          title="Export Map Snapshot"
        >
          <Printer className="size-3.5" />
        </Button>
      </div>

      {/* ─── CENTER TOP BANNER: ACTIVE GIS TOOL OR ALERT RADAR WIDGET ─── */}
      {tool === "measure" || tool === "draw" ? (
        <div className="absolute top-3 start-1/2 -translate-x-1/2 z-20 h-10 bg-background/95 backdrop-blur-md border rounded-xl shadow-md px-3.5 text-xs flex items-center gap-2.5 whitespace-nowrap animate-in fade-in duration-150 pointer-events-auto">
          {tool === "measure" ? (
            <>
              <Ruler className="size-4 text-amber-500 animate-pulse" />
              <span className="text-muted-foreground">{t("map.measure")}:</span>
              <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                {measurePoints.length > 1
                  ? `${(measureDistance / 1000).toFixed(2)} km`
                  : lang === "ar"
                    ? "انقر على الخريطة لحساب المسافة"
                    : "Click on map to measure path"}
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
              <Pencil className="size-4 text-primary animate-pulse" />
              <span className="text-muted-foreground">{t("map.draw")}:</span>
              <Badge variant="secondary" className="tabular-nums font-mono text-xs">
                {drawPoints.length >= 3
                  ? `${(drawArea / 1_000_000).toFixed(3)} km²`
                  : `${drawPoints.length} points`}
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
      ) : (
        <div className="absolute top-3 start-1/2 -translate-x-1/2 z-20 h-10 bg-background/90 backdrop-blur-md border rounded-xl shadow-md px-3 flex items-center gap-2 whitespace-nowrap animate-in fade-in duration-150 pointer-events-auto max-w-[calc(100vw-360px)] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 font-bold text-foreground pe-2 border-e border-border/50 text-[0.72rem]">
            <ShieldAlert className="size-3.5 text-primary animate-pulse" />
            <span className="hidden sm:inline">{lang === "ar" ? "رادار التنبيهات" : "Alert Radar"}</span>
          </div>

          {/* Severity Filter Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAlertSeverityFilter("all")}
              className={cn(
                "px-2 py-0.5 rounded-md text-[0.65rem] font-semibold transition-all",
                alertSeverityFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {lang === "ar" ? "الكل (12)" : "All (12)"}
            </button>

            <button
              type="button"
              onClick={() => setAlertSeverityFilter("critical")}
              className={cn(
                "px-2 py-0.5 rounded-md text-[0.65rem] font-semibold transition-all flex items-center gap-1",
                alertSeverityFilter === "critical"
                  ? "bg-rose-600 text-white shadow-xs font-bold"
                  : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              )}
            >
              <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>{lang === "ar" ? "حرج (4)" : "Critical (4)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setAlertSeverityFilter("warning")}
              className={cn(
                "px-2 py-0.5 rounded-md text-[0.65rem] font-semibold transition-all flex items-center gap-1",
                alertSeverityFilter === "warning"
                  ? "bg-amber-500 text-slate-950 font-bold shadow-xs"
                  : "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
              )}
            >
              <span>{lang === "ar" ? "تحذير (5)" : "Warning (5)"}</span>
            </button>

            <button
              type="button"
              onClick={() => setAlertSeverityFilter("info")}
              className={cn(
                "px-2 py-0.5 rounded-md text-[0.65rem] font-semibold transition-all",
                alertSeverityFilter === "info"
                  ? "bg-sky-500 text-white shadow-xs font-bold"
                  : "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20"
              )}
            >
              <span>{lang === "ar" ? "معلوماتي (3)" : "Info (3)"}</span>
            </button>
          </div>

          <Separator orientation="vertical" className="h-4 mx-0.5" />

          {/* Direct Executive Briefing Trigger */}
          <button
            type="button"
            onClick={() =>
              handleSendMessage(
                undefined,
                lang === "ar"
                  ? "قدم لي إحاطة تنفيذية شاملة لكافة التنبيهات الـ 12 النشطة بالرياض مع رسم بياني."
                  : "Explain overall city risk and summarize all active alerts in Riyadh with visualization."
              )
            }
            className="flex items-center gap-1 text-[0.65rem] font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-md transition-colors"
            title={lang === "ar" ? "تحليل شامل بالذكاء الاصطناعي" : "AI City-Wide Risk Briefing"}
          >
            <Sparkles className="size-3 text-emerald-400" />
            <span className="hidden sm:inline">{lang === "ar" ? "إحاطة شاملة" : "Executive Briefing"}</span>
          </button>
        </div>
      )}

      {/* ─── LIVE ATMOSPHERIC & DRONE OPERATIONS HUD WIDGET ────────────── */}
      <div className="absolute bottom-12 start-3 z-30 flex flex-col gap-2 pointer-events-auto">
        {envHudOpen ? (
          <Card className="w-80 bg-background/95 backdrop-blur-xl border border-primary/30 rounded-xl shadow-2xl p-3 space-y-2.5 animate-in fade-in-50 duration-200 ring-1 ring-primary/20">
            <div className="flex items-center justify-between border-b pb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Wind className="size-3.5 text-sky-400" />
                <span>{lang === "ar" ? "الاستشعار الجوي والمسيرات" : "Atmospheric & Drone HUD"}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-5 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setEnvHudOpen(false)}
              >
                <X className="size-3" />
              </Button>
            </div>

            {/* Atmospheric Sensor Pod */}
            <div className="bg-muted/40 rounded-lg p-2 border border-border/40 space-y-1.5">
              <div className="flex items-center justify-between text-[0.68rem]">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Thermometer className="size-3 text-amber-500" />
                  <span>35°C</span>
                  <span className="text-[0.6rem] text-muted-foreground">(Feels 37°)</span>
                </span>
                <span className="font-mono text-muted-foreground flex items-center gap-1">
                  <Wind className="size-3 text-sky-400" />
                  <span>18 km/h NW</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-[0.65rem]">
                <Badge variant="outline" className="text-[0.6rem] px-1.5 py-0 border-emerald-500/40 text-emerald-500 font-medium">
                  AQI 74 (Moderate · PM2.5: 22)
                </Badge>
                <Badge variant="secondary" className="text-[0.58rem] px-1 py-0 font-mono">
                  Sentinel-2 Sync
                </Badge>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    lang === "ar"
                      ? "اشرح لي حالة الطقس ومؤشر جودة الهواء بالرياض مع رسم بياني للحرارة."
                      : "Explain Riyadh atmospheric telemetry, weather station sensors, and AQI trend."
                  )
                }
                className="w-full text-center text-[0.65rem] font-bold text-primary hover:underline bg-primary/10 hover:bg-primary/15 py-1 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Bot className="size-3" />
                <span>{lang === "ar" ? "تحليل الطقس وجودة الهواء بالذكاء الاصطناعي" : "Analyze Weather & AQI with AI"}</span>
              </button>
            </div>

            {/* Municipal UAV Drone Patrol Fleet */}
            <div className="bg-muted/40 rounded-lg p-2 border border-border/40 space-y-1.5">
              <div className="flex items-center justify-between text-[0.68rem]">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Plane className="size-3 text-emerald-400 animate-pulse" />
                  <span>{lang === "ar" ? "أسطول المسيرات (UAV)" : "Municipal Drone Patrol"}</span>
                </span>
                <span className="text-[0.6rem] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  3 Airborne
                </span>
              </div>

              <div className="text-[0.62rem] text-muted-foreground space-y-0.5 font-medium">
                <div>• Alpha-1: Al Malqa & Olaya (ROW Patrol)</div>
                <div>• Bravo-3: Industrial Zone 2 (Thermal FLIR)</div>
                <div>• Delta-2: Wadi Hanifa (Flood Sensor)</div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleSendMessage(
                    undefined,
                    lang === "ar"
                      ? "اشرح لي مهام أسطول الطائرات المسيرة بالرياض وأحدث نتائج الرصد الجوي مع رسم بياني."
                      : "Explain autonomous municipal drone fleet operations, coverage, and detections with chart."
                  )
                }
                className="w-full text-center text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 hover:bg-emerald-500/15 py-1 rounded-md transition-colors flex items-center justify-center gap-1"
              >
                <Bot className="size-3" />
                <span>{lang === "ar" ? "تحليل رصد المسيرات بالذكاء الاصطناعي" : "Analyze Drone Fleet with AI"}</span>
              </button>
            </div>
          </Card>
        ) : null}
      </div>

      {/* ─── BOTTOM CONTROLS DOCK (Coordinates + Weather/Drone HUD) ──── */}
      <div className="absolute bottom-3 start-3 z-20 flex items-center gap-2 pointer-events-auto">
        <div className="h-8 bg-background/90 backdrop-blur-md border rounded-lg shadow-sm px-2.5 text-[0.68rem] text-muted-foreground font-mono tabular-nums flex items-center">
          📍 {coords.lon.toFixed(4)}° E · {coords.lat.toFixed(4)}° N
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setEnvHudOpen(!envHudOpen)}
          className={cn(
            "h-8 gap-1.5 px-2.5 rounded-lg text-xs bg-background/90 backdrop-blur-md border shadow-sm font-semibold transition-all",
            envHudOpen
              ? "border-primary bg-primary/10 text-primary"
              : "hover:border-primary text-foreground"
          )}
        >
          <Wind className="size-3.5 text-sky-400" />
          <span className="hidden sm:inline">{lang === "ar" ? "محطة الطقس والمسيرات" : "Weather & Drone HUD"}</span>
          <span className="sm:hidden">{lang === "ar" ? "الطقس" : "Weather"}</span>
          <Badge variant="secondary" className="h-4 px-1 text-[0.58rem] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Active
          </Badge>
        </Button>
      </div>

      {/* ─── ULTRA-MODERN AI CHATBOT WITH INTERACTIVE VISUALIZATIONS ──────── */}
      {chatbotOpen ? (
        <div
          style={{
            width: isMaximized ? undefined : `${chatWidth}px`,
          }}
          className={cn(
            "absolute z-30 flex flex-col transition-all duration-200 ease-out shadow-2xl",
            isMaximized
              ? "top-3 bottom-3 end-3 w-[min(960px,calc(100vw-24px))]"
              : "top-[58px] bottom-3 end-3 max-w-[calc(100vw-24px)]"
          )}
        >
          {/* Draggable Resize Handle on the inner edge */}
          {!isMaximized && (
            <div
              onMouseDown={startResize}
              className="absolute -start-2.5 top-0 bottom-0 w-5 cursor-ew-resize flex items-center justify-center z-50 group select-none"
              title={lang === "ar" ? "اسحب لتعديل عرض النافذة" : "Drag to resize chatbot width"}
            >
              <div className="w-1.5 h-16 rounded-full bg-border/80 group-hover:bg-primary group-hover:scale-y-125 transition-all shadow-md flex items-center justify-center">
                <GripVertical className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}

          <Card className="flex-1 bg-background/95 backdrop-blur-2xl border-2 border-primary/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-primary/20">
            {/* Chatbot Header */}
            <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-primary/20 via-primary/10 to-transparent shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-7 rounded-lg bg-gradient-to-tr from-primary to-emerald-400 text-primary-foreground flex items-center justify-center shadow-md shrink-0">
                  <Bot className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                    <span className="truncate">{lang === "ar" ? "مساعد جيو وايز" : "GeoWise AI"}</span>
                    <Badge variant="outline" className="text-[0.58rem] px-1 py-0 border-primary/40 text-primary shrink-0">
                      v2.4
                    </Badge>
                  </div>
                  <div className="text-[0.6rem] text-emerald-500 font-medium flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="truncate">Live Telemetry</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Width Presets (Compact, Standard, Wide) - only show on large screens */}
                <div className="hidden lg:flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[0.6rem]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMaximized(false);
                      setChatWidth(380);
                    }}
                    className={cn(
                      "px-1.5 py-0.5 rounded font-medium transition-all",
                      chatWidth === 380 && !isMaximized
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Compact view (380px)"
                  >
                    380px
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMaximized(false);
                      setChatWidth(500);
                    }}
                    className={cn(
                      "px-1.5 py-0.5 rounded font-medium transition-all",
                      chatWidth === 500 && !isMaximized
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Standard view (500px)"
                  >
                    500px
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMaximized(false);
                      setChatWidth(700);
                    }}
                    className={cn(
                      "px-1.5 py-0.5 rounded font-medium transition-all",
                      chatWidth === 700 && !isMaximized
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    title="Wide view (700px)"
                  >
                    700px
                  </button>
                </div>

                {/* Reset Chat */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() =>
                          setMessages([
                            {
                              id: "m-reset",
                              role: "assistant",
                              content:
                                lang === "ar"
                                  ? "تمت إعادة ضبط جلسة المساعد. انقر على أي تنبيه في الخريطة لبدء الإحاطة الذكية."
                                  : "Session refreshed. Click any pulsing alert beacon on the map to start an instant briefing.",
                              timestamp: "Just now",
                            },
                          ])
                        }
                      >
                        <RefreshCw className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{lang === "ar" ? "إعادة ضبط المحادثة" : "Reset Chat"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Maximize / Normal Window */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                        onClick={() => setIsMaximized(!isMaximized)}
                      >
                        {isMaximized ? <Minimize2 className="size-3.5" /> : <Maximize className="size-3.5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isMaximized ? "Restore" : "Maximize"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Dedicated Close Button: clean icon button that never gets cut off */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/15 shrink-0"
                  onClick={() => setChatbotOpen(false)}
                  title={lang === "ar" ? "إغلاق" : "Close"}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-4">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "chat-bubble-entry flex flex-col text-xs transition-all",
                      isUser ? "ms-auto items-end max-w-[85%]" : "me-auto items-start w-full"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl shadow-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none text-[0.75rem] transition-all w-full",
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted/80 text-foreground border border-border/50 rounded-bl-none shadow-md backdrop-blur-sm"
                      )}
                    >
                      <ReactMarkdown>{m.content}</ReactMarkdown>

                      {/* Embedded Interactive Chart */}
                      {m.chart && (
                        <div className="mt-3 pt-3 border-t border-border/40">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[0.75rem] text-primary flex items-center gap-1.5">
                              <BarChart3 className="size-4" />
                              <span>{lang === "ar" ? m.chart.titleAr || m.chart.title : m.chart.title}</span>
                            </span>
                            {m.chart.unit && (
                              <Badge variant="outline" className="text-[0.62rem] px-1.5 py-0.5 border-primary/30 font-mono">
                                {m.chart.unit}
                              </Badge>
                            )}
                          </div>

                          <div className="h-44 w-full bg-background/70 rounded-xl p-2.5 border border-border/40 shadow-inner">
                            {m.chart.type === "bar" && (
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={m.chart.data} margin={{ top: 12, right: 16, left: -10, bottom: 26 }}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                  <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    interval={0}
                                    dy={6}
                                  />
                                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                                <LineChart data={m.chart.data} margin={{ top: 12, right: 16, left: -10, bottom: 26 }}>
                                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                  <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    interval={0}
                                    dy={6}
                                  />
                                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
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
                                    strokeWidth={2.5}
                                    dot={{ r: 4, fill: "#10b981" }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            )}

                            {m.chart.type === "pie" && (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
                                  <Pie
                                    data={m.chart.data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={46}
                                    label={({ name, percent }) =>
                                      `${name.split(" ")[0]}: ${((percent || 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                  >
                                    {m.chart.data.map((_, idx) => (
                                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
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

                      {/* Interactive Action Shortcuts for Alerts */}
                      {m.alertRef && (
                        <div className="mt-3 pt-2.5 border-t border-border/40 flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (mapRef.current && m.alertRef) {
                                mapRef.current.flyTo({
                                  center: [m.alertRef.lon, m.alertRef.lat],
                                  zoom: 16,
                                  duration: 1000,
                                  essential: true,
                                });
                                toast.success(lang === "ar" ? "تم التقريب إلى الهدف" : "Focused on alert target");
                              }
                            }}
                            className="flex items-center gap-1 text-[0.65rem] font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <MapPin className="size-3" />
                            <span>{lang === "ar" ? "تقريب للهدف" : "Focus on Map"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toast.success(
                                lang === "ar"
                                  ? `تم إنشاء تذكرة تحقيق لـ ${m.alertRef?.id}`
                                  : `Investigation case opened for ${m.alertRef?.id}`
                              );
                            }}
                            className="flex items-center gap-1 text-[0.65rem] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <FileCheck2 className="size-3" />
                            <span>{lang === "ar" ? "فتح تذكرة بلدية" : "Create Case"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toast.info(
                                lang === "ar"
                                  ? "تم إرسال إشعار العمليات الميدانية"
                                  : "Field dispatch notification transmitted"
                              );
                            }}
                            className="flex items-center gap-1 text-[0.65rem] font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <BellRing className="size-3" />
                            <span>{lang === "ar" ? "إشعار الطوارئ" : "Dispatch Alert"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[0.6rem] text-muted-foreground px-1 mt-1 font-mono">
                      {m.timestamp}
                    </span>
                  </div>
                );
              })}

              {isChatLoading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/70 p-3 rounded-2xl max-w-[200px] border border-border/40 shadow-sm animate-pulse">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="font-medium text-[0.72rem]">Generating AI analysis & chart...</span>
                </div>
              )}
            </div>

            {/* Quick Interactive Prompt Chips */}
            <div className="border-t bg-muted/20 shrink-0">
              <div className="px-3 py-1 flex items-center justify-between text-[0.62rem] text-muted-foreground">
                <span className="font-semibold">{lang === "ar" ? "استعلامات سريعة مقترحة (مرر أفقياً)" : "Suggested Quick Prompts (Scroll)"}</span>
                <button
                  type="button"
                  onClick={() => setShowPromptChips(!showPromptChips)}
                  className="text-primary hover:underline font-medium flex items-center gap-0.5"
                >
                  <span>{showPromptChips ? (lang === "ar" ? "إخفاء" : "Hide") : (lang === "ar" ? "إظهار" : "Show")}</span>
                  {showPromptChips ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
                </button>
              </div>

              {showPromptChips && (
                <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    {
                      label: lang === "ar" ? "🕳️ هبوط الدرعية" : "🕳️ Diriyah Subsidence",
                      prompt:
                        lang === "ar"
                          ? "اشرح تنبيه الهبوط الأرضي ورادار InSAR بنطاق الدرعية التاريخية مع رسم بياني."
                          : "Explain Diriyah historical ground subsidence and subterranean seepage alert with chart.",
                    },
                    {
                      label: lang === "ar" ? "🌫️ غبار المطار" : "🌫️ Airport PM10 Dust",
                      prompt:
                        lang === "ar"
                          ? "اشرح ارتفاع تركيز الجسيمات الدقيقة PM10 بمطار الملك خالد وتأثيره على جودة الهواء."
                          : "Explain King Khalid Airport dust particulate PM10 surge and air quality impact.",
                    },
                    {
                      label: lang === "ar" ? "⚡ حرارة كافد" : "⚡ KAFD Overload",
                      prompt:
                        lang === "ar"
                          ? "حلل الحمل الحراري الزائد على محولات محطة كافد الرئيسية."
                          : "Analyze KAFD main electrical substation transformer thermal overload.",
                    },
                    {
                      label: lang === "ar" ? "🚛 نفايات العزيزية" : "🚛 Aziziyah Waste",
                      prompt:
                        lang === "ar"
                          ? "قدم إيجازاً عن تفريغ النفايات الصناعية غير المرخصة بحي العزيزية."
                          : "Provide briefing on unauthorized industrial waste dumping in Al Aziziyah.",
                    },
                    {
                      label: lang === "ar" ? "🚇 مسار المترو" : "🚇 Metro Track",
                      prompt:
                        lang === "ar"
                          ? "اشرح اختراق المحيط الأمني لمسار قطار الرياض الخط 3 بالبطحاء."
                          : "Explain Riyadh Metro Line 3 security perimeter intrusion in Al Batha.",
                    },
                    {
                      label: lang === "ar" ? "🏢 برج المملكة" : "🏢 Kingdom Tower",
                      prompt:
                        lang === "ar"
                          ? "حلل قراءات الاهتزاز وقص الرياح بجسر المشاهدة المعلق ببرج المملكة."
                          : "Analyze Sky Bridge dynamic vibration and wind shear telemetry.",
                    },
                    {
                      label: lang === "ar" ? "🚨 سيول الشميسي" : "🚨 Shemaysi Flood",
                      prompt:
                        lang === "ar"
                          ? "اشرح تنبيه سيول الشميسي وتجمع المياه وقراءات الحساسات الهيدرولوجية."
                          : "Explain Shemaysi flood alert with water accumulation telemetry.",
                    },
                    {
                      label: lang === "ar" ? "🏗️ حفريات العليا" : "🏗️ Olaya Excavation",
                      prompt:
                        lang === "ar"
                          ? "حلل الحفريات غير المرخصة في حي العليا واعرض رسم بياني للحجم."
                          : "Analyze unauthorized excavation in Al Olaya and show volume chart.",
                    },
                    {
                      label: lang === "ar" ? "🔥 حرارة الصناعية" : "🔥 Industrial Heat",
                      prompt:
                        lang === "ar"
                          ? "اعرض قراءات الشذوذ الحراري للمدينة الصناعية الجنوبية."
                          : "Show thermal sensor temperature anomaly trend for South Industrial District.",
                    },
                    {
                      label: lang === "ar" ? "🛸 أسراب الدرون" : "🛸 Drone Fleet",
                      prompt:
                        lang === "ar"
                          ? "اشرح عمليات وتغطية أسراب الطائرات المسيرة البلدية والاكتشافات مع رسم بياني."
                          : "Explain autonomous municipal drone fleet operations, coverage, and detections with chart.",
                    },
                    {
                      label: lang === "ar" ? "🌤️ الطقس والهواء" : "🌤️ Weather & AQI",
                      prompt:
                        lang === "ar"
                          ? "اشرح قياسات الطقس والرياح ومؤشر جودة الهواء لمدينة الرياض."
                          : "Explain Riyadh atmospheric telemetry, weather station sensors, and AQI trend.",
                    },
                    {
                      label: lang === "ar" ? "📊 تقييم المخاطر" : "📊 Overall Risk",
                      prompt:
                        lang === "ar"
                          ? "اشرح تقييم المخاطر الشامل ولخص كافة التنبيهات النشطة بالرياض مع رسم بياني."
                          : "Explain overall city risk and summarize all active alerts in Riyadh with visualization.",
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => handleSendMessage(undefined, s.prompt)}
                      className="shrink-0 whitespace-nowrap text-[0.65rem] font-semibold bg-background hover:bg-primary/10 hover:border-primary/50 hover:text-primary border px-2.5 py-1 rounded-lg text-muted-foreground transition-all shadow-xs"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input Form */}
            <form onSubmit={(e) => handleSendMessage(e)} className="p-2.5 border-t bg-background flex items-center gap-1.5 shrink-0">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={lang === "ar" ? "اسأل المساعد الذكي عن أي تنبيه أو معلم..." : "Ask AI about alerts, sensor charts, or coordinates..."}
                className="flex-1 bg-muted/60 border border-border/40 focus:border-primary focus:bg-background text-xs rounded-xl px-3.5 py-2.5 outline-none transition-all"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!chatInput.trim() || isChatLoading}
                className="size-9 rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
              >
                <Send className="size-4" />
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        /* Floating Chatbot Launcher Button when closed */
        <Button
          onClick={() => setChatbotOpen(true)}
          className="absolute bottom-4 end-4 z-40 h-11 px-4 gap-2.5 rounded-2xl shadow-2xl bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 text-white font-bold text-xs hover:scale-105 transition-all ring-2 ring-white/20 animate-in fade-in-50 duration-200"
        >
          <Bot className="size-5 animate-bounce" />
          <span>GeoWise AI Chatbot</span>
          <Badge variant="secondary" className="h-5 px-1.5 text-[0.65rem] bg-white/25 text-white font-bold">
            6 Alerts
          </Badge>
        </Button>
      )}
    </div>
  );
}
