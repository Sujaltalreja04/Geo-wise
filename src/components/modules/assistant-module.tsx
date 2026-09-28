"use client";

import * as React from "react";
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
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export interface ChartSpec {
  type: "bar" | "line" | "pie";
  title: string;
  data: { name: string; value: number }[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartSpec | null;
  sources?: string[];
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

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [visualize, setVisualize] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // welcome message
  React.useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: t("assistant.welcome"),
        ts: new Date().toISOString(),
      },
    ]);
  }, [lang, t]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

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
          ts: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(
        lang === "ar"
          ? `تعذّر الاتصال بالمساعد: ${msg}`
          : `Assistant unavailable: ${msg}`
      );
      setMessages((m) => [
        ...m,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            lang === "ar"
              ? "تعذّر الاتصال بقاعدة المعرفة. حاول مجددًا. (هذه مخرجات لدعم القرار فقط.)"
              : "Could not reach the knowledge base. Please retry. (This is decision-support only.)",
          ts: new Date().toISOString(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const suggestions = lang === "ar" ? SUGGESTIONS_AR : SUGGESTIONS_EN;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ModuleHeader
        moduleId="M12"
        titleKey="assistant.title"
        subtitleKey="assistant.subtitle"
        icon={Bot}
        actions={
          <Badge
            variant="outline"
            className="gap-1.5 text-chart-3 border-chart-3/40"
          >
            <ShieldCheck className="size-3" />
            {lang === "ar" ? "يحترم صلاحياتك" : "Permission-scoped"}
          </Badge>
        }
      />
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Chat area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-4 space-y-3"
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} m={m} />
          ))}
          {busy && (
            <div className="flex items-start gap-3">
              <div className="grid place-items-center size-8 rounded-lg bg-primary/15 ring-1 ring-primary/30 text-primary shrink-0">
                <Bot className="size-4" />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="size-4 animate-spin" />
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
                className="text-[0.75rem] px-2.5 py-1 rounded-full border bg-muted/30 hover:bg-muted/60 transition-colors text-start"
              >
                <Sparkles className="size-3 me-1 inline text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer - compact & anchored */}
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
                placeholder={t("assistant.placeholder")}
                className="w-full resize-none min-h-[38px] max-h-24 px-3 py-2 pe-8 rounded-lg border bg-muted/20 text-sm focus-visible:bg-background outline-none focus-visible:border-primary/40 leading-snug"
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
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                  aria-label="clear"
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
                "h-[38px] px-2.5 text-xs gap-1.5 shrink-0 transition-all",
                visualize
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={
                lang === "ar" ? "تفعيل العرض البياني" : "Toggle Visualization"
              }
            >
              <BarChart3 className="size-3.5" />
              <span className="hidden sm:inline text-xs">
                {lang === "ar" ? "رسم بياني" : "Visualize"}
              </span>
            </Button>

            <Button
              type="submit"
              disabled={busy || !input.trim()}
              className="h-[38px] px-3 shrink-0"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4 rtl:rotate-180" />
              )}
            </Button>
          </form>
          <div className="flex items-center justify-between mt-1 text-[0.62rem] text-muted-foreground">
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
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const lang = useGeoWiseStore((s) => s.lang);
  const isUser = m.role === "user";

  // Clean raw markdown chart fence if present
  const cleanContent = m.content
    .replace(/```chart\s*[\s\S]*?\s*```/g, "")
    .trim();

  return (
    <div
      className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid place-items-center size-8 rounded-lg shrink-0",
          isUser
            ? "bg-muted text-foreground ring-1 ring-border"
            : "bg-primary/15 ring-1 ring-primary/30 text-primary"
        )}
      >
        {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className={cn("max-w-[85%] flex flex-col", isUser && "items-end")}>
        <Card
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed",
            isUser && "bg-primary/10 border-primary/20"
          )}
        >
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="text-sm leading-relaxed prose dark:prose-invert max-w-none space-y-1.5 [&_p]:my-1 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:ps-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:ps-5 [&_li]:my-0.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-2.5 [&_h3]:mb-1 [&_h4]:text-xs [&_h4]:font-semibold [&_h4]:mt-2 [&_h4]:mb-1 [&_hr]:my-2 [&_hr]:border-border/50"
          >
            {isUser ? (
              <div className="whitespace-pre-wrap break-words">{cleanContent}</div>
            ) : (
              <ReactMarkdown>{cleanContent}</ReactMarkdown>
            )}
          </div>

          {/* Interactive Recharts Visualization */}
          {m.chart && m.chart.data && m.chart.data.length > 0 && (
            <div className="mt-3 p-3 bg-muted/40 border border-border/60 rounded-lg">
              <div className="text-xs font-semibold mb-2 flex items-center gap-1.5 text-primary">
                <BarChart3 className="size-3.5" />
                <span>{m.chart.title}</span>
              </div>
              <div className="h-48 w-full text-xs">
                {m.chart.type === "bar" && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={m.chart.data}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#fff",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
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
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={11}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4 }}
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
                        outerRadius={58}
                        label={({ name, percent }) =>
                          `${name}: ${((percent || 0) * 100).toFixed(0)}%`
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
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#fff",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          )}
        </Card>

        {m.sources && m.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {m.sources.map((s) => (
              <Badge
                key={s}
                variant="secondary"
                className="text-[0.6rem] font-mono"
              >
                {s}
              </Badge>
            ))}
          </div>
        )}
        <span className="text-[0.6rem] text-muted-foreground mt-1 px-1">
          {new Date(m.ts).toLocaleTimeString(
            lang === "ar" ? "ar-SA" : "en-GB",
            { hour: "2-digit", minute: "2-digit" }
          )}
        </span>
      </div>
    </div>
  );
}

export default AssistantModule;
