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
} from "lucide-react";
import { useGeoWiseStore } from "@/stores/app-store";
import { ModuleHeader, ModuleBody } from "./module-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  ts: string;
}

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

async function askAssistant(messages: ChatMessage[], lang: "ar" | "en") {
  const res = await fetch("/api/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      lang,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Assistant error");
  }
  return res.json() as Promise<{ reply: string; sources: string[] }>;
}

export function AssistantModule() {
  const t = useGeoWiseStore((s) => s.t);
  const lang = useGeoWiseStore((s) => s.lang);

  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
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
      const { reply, sources } = await askAssistant(nextMessages, lang);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          sources,
          ts: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(lang === "ar" ? `تعذّر الاتصال بالمساعد: ${msg}` : `Assistant unavailable: ${msg}`);
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
    <div className="flex flex-col h-full min-h-0">
      <ModuleHeader
        moduleId="M12"
        titleKey="assistant.title"
        subtitleKey="assistant.subtitle"
        icon={Bot}
        actions={
          <Badge variant="outline" className="gap-1.5 text-chart-3 border-chart-3/40">
            <ShieldCheck className="size-3" />
            {lang === "ar" ? "يحترم صلاحياتك" : "Permission-scoped"}
          </Badge>
        }
      />
      <ModuleBody className="flex flex-col p-0">
        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 md:p-6 space-y-4">
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
          <div className="px-4 md:px-6 pb-2 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 rounded-full border bg-muted/30 hover:bg-muted/60 transition-colors text-start"
              >
                <Sparkles className="size-3 me-1.5 inline text-primary" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div className="border-t p-3 md:p-4 bg-background/80 backdrop-blur">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
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
                className="w-full resize-none max-h-32 px-3 py-2.5 pe-9 rounded-lg border bg-muted/30 text-sm focus-visible:bg-background outline-none focus-visible:border-primary/40"
                dir={lang === "ar" ? "rtl" : "ltr"}
              />
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMessages([{ id: "welcome", role: "assistant", content: t("assistant.welcome"), ts: new Date().toISOString() }])}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="clear"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" disabled={busy || !input.trim()} className="h-10 px-3">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:rotate-180" />}
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[0.65rem] text-muted-foreground">
            <span className="flex items-center gap-1">
              <CornerDownLeft className="size-3" />
              {lang === "ar" ? "Enter للإرسال · Shift+Enter لسطر جديد" : "Enter to send · Shift+Enter for newline"}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3 text-chart-3" />
              {t("assistant.disclaimer")}
            </span>
          </div>
        </div>
      </ModuleBody>
    </div>
  );
}

function ChatBubble({ m }: { m: ChatMessage }) {
  const lang = useGeoWiseStore((s) => s.lang);
  const isUser = m.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
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
      <div className={cn("max-w-[80%] flex flex-col", isUser && "items-end")}>
        <Card className={cn("px-3.5 py-2.5 text-sm leading-relaxed", isUser && "bg-primary/10 border-primary/20")}>
          <div dir={lang === "ar" ? "rtl" : "ltr"} className="whitespace-pre-wrap break-words">{m.content}</div>
        </Card>
        {m.sources && m.sources.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {m.sources.map((s) => (
              <Badge key={s} variant="secondary" className="text-[0.6rem] font-mono">
                {s}
              </Badge>
            ))}
          </div>
        )}
        <span className="text-[0.6rem] text-muted-foreground mt-1 px-1">
          {new Date(m.ts).toLocaleTimeString(lang === "ar" ? "ar-SA" : "en-GB", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
