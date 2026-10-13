"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import {
  ShieldAlert,
  Info,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AiMessageRendererProps {
  content: string;
  isUser?: boolean;
  className?: string;
  onLocationClick?: (coords: { lon: number; lat: number }) => void;
}

/**
 * Normalizes malformed tables produced by LLMs:
 * 1. Delimiter column count mismatch (e.g. 5 header cols vs 4 delimiter cols)
 * 2. Leading double pipes "||"
 * 3. Tables missing a delimiter row entirely
 * 4. Missing empty lines before and after tables
 */
function repairMarkdownTables(raw: string): string {
  const lines = raw.split("\n");
  const result: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;

    // Parse each line into clean trimmed cells
    const parsedRows = tableRows.map((line) => {
      // Clean leading double pipes: "||" -> "|"
      let clean = line.trim().replace(/^\|+/, "|").replace(/\|+$/, "|");
      // Split by pipe
      let cells = clean.split("|").slice(1, -1).map((c) => c.trim());
      return cells;
    });

    if (parsedRows.length === 0 || parsedRows.every((r) => r.length === 0)) {
      tableRows = [];
      inTable = false;
      return;
    }

    // Check if second row is a delimiter row (only hyphens, colons, spaces)
    const isDelimiter = (cells: string[]) =>
      cells.length > 0 && cells.every((c) => /^[:\s-]+$/.test(c));

    let headerCells: string[] = parsedRows[0];
    let dataRows: string[][] = [];

    // Determine max column count across all rows
    let colCount = 0;
    parsedRows.forEach((r) => {
      if (r.length > colCount) colCount = r.length;
    });

    if (parsedRows.length > 1 && isDelimiter(parsedRows[1])) {
      // It had a delimiter
      headerCells = parsedRows[0];
      dataRows = parsedRows.slice(2);
    } else {
      // Missing delimiter: check if first row looks like data
      const isFirstRowData = parsedRows[0].some(
        (c) => c.length > 32 || c.split(/\s+/).length > 4
      );
      if (isFirstRowData) {
        if (colCount === 2) headerCells = ["Directive / Action", "Operational Status"];
        else if (colCount === 3)
          headerCells = ["Operational Action", "Responsible Entity", "Directive / Mandate"];
        else if (colCount === 4)
          headerCells = ["Metric / Factor", "Threshold", "Status", "Operational Action"];
        else if (colCount === 5)
          headerCells = [
            "Scenario",
            "Likelihood",
            "Impact",
            "Mitigation Status",
            "Recommended Action",
          ];
        else
          headerCells = Array.from({ length: colCount }, (_, idx) => `Field ${idx + 1}`);
        dataRows = parsedRows;
      } else {
        headerCells = parsedRows[0];
        dataRows = parsedRows.slice(1);
      }
    }

    // Pad header cells if needed
    while (headerCells.length < colCount) {
      headerCells.push(`Field ${headerCells.length + 1}`);
    }

    // Generate clean GFM table
    result.push("");
    result.push(`| ${headerCells.join(" | ")} |`);
    result.push(`| ${Array(colCount).fill("---").join(" | ")} |`);

    dataRows.forEach((row) => {
      const padded = [...row];
      while (padded.length < colCount) padded.push("—");
      result.push(`| ${padded.slice(0, colCount).join(" | ")} |`);
    });
    result.push("");

    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // A table line contains multiple '|'
    const isPipeLine =
      (line.startsWith("|") && line.endsWith("|")) ||
      (line.includes("|") && (line.match(/\|/g) || []).length >= 2);

    if (isPipeLine) {
      inTable = true;
      tableRows.push(line);
    } else {
      if (inTable) {
        flushTable();
      }
      result.push(lines[i]);
    }
  }

  if (inTable) {
    flushTable();
  }

  return result.join("\n");
}

/**
 * Normalizes and beautifies raw LLM responses:
 * 1. Converts unformatted section headers ("1. Context", "2. Findings", "A. Vibration") into Markdown headers.
 * 2. Formats jammed metadata lines (Alert ID, Coordinates, Severity, Confidence).
 * 3. Repairs broken/glued LLM Markdown table syntax into valid GFM tables.
 * 4. Highlights operational labels and decision-support notices.
 */
function normalizeAssistantMarkdown(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // 1. Intelligence Briefing Header
  text = text.replace(/^([ \t]*)(Intelligence Briefing:[^\n]+)/im, "## 🛰️ $2\n\n");
  text = text.replace(/^([ \t]*)(إيجاز استخباراتي:[^\n]+)/im, "## 🛰️ $2\n\n");

  // 2. Metadata separation (Alert ID, Location, Coordinates, Severity, Detection Time, AI Confidence)
  text = text.replace(
    /\b(Alert ID:\s*\[?[^\]\n]+\]?)\s+(Location:)/g,
    "\n- **$1**\n- **$2"
  );
  text = text.replace(
    /\b(Coordinates:\s*\[[^\]]+\])\s+(Severity:)/g,
    "\n- **$1**\n- **$2"
  );
  text = text.replace(
    /\b(Severity:\s*[A-Z_]+(?:\s*\([^)]+\))?)\s+(Detection Time:)/g,
    "\n- **$1**\n- **$2"
  );
  text = text.replace(
    /\b(Detection Time:\s*[^A-Z\n]+)\s+(AI Confidence:)/g,
    "\n- **$1** | **$2"
  );

  // 3. Numbered Major Sections: "1. Heading", "2. Heading", etc.
  text = text.replace(
    /(?:^|\n)([0-9]+)\.\s+([A-Z\u0600-\u06FF][^\n:]{3,60})(?:\n|$)/g,
    "\n\n### $1. $2\n\n"
  );

  // 4. Lettered Subsections: "A. Heading", "B. Heading", etc.
  text = text.replace(
    /(?:^|\n)([A-Z])\.\s+([A-Z\u0600-\u06FF][^\n:]{3,60})(?:\n|$)/g,
    "\n\n#### $1. $2\n\n"
  );

  // 5. Bold operational subheadings in Recommendations
  text = text.replace(
    /\n(Operational|Maintenance|Emergency Protocol|Data Collection):\s*/g,
    "\n- **$1**: "
  );
  text = text.replace(
    /\n(إجراءات تشغيلية|الصيانة الوقائية|خطة الطوارئ|جمع وتحديث البيانات):\s*/g,
    "\n- **$1**: "
  );

  // 6. Systematic Table Parser & Delimiter Repair
  text = repairMarkdownTables(text);

  // 7. Decision-Support Notice callout
  text = text.replace(
    /(This is decision-support;\s*verify before enforcement\.?)/gi,
    "\n\n> 🛡️ **Decision-Support Notice**: $1\n\n"
  );
  text = text.replace(
    /(هذه مخرجات لدعم القرار؛\s*تحقق قبل التنفيذ\.?)/g,
    "\n\n> 🛡️ **تنبيه دعم القرار**: $1\n\n"
  );

  return text;
}

export function AiMessageRenderer({
  content,
  isUser = false,
  className,
  onLocationClick,
}: AiMessageRendererProps) {
  const normalized = React.useMemo(() => {
    return isUser ? content : normalizeAssistantMarkdown(content);
  }, [content, isUser]);

  if (isUser) {
    return (
      <div className={cn("text-xs leading-relaxed whitespace-pre-wrap font-medium", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn("ai-message-content space-y-2.5 text-xs leading-relaxed", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-foreground tracking-tight pb-1.5 border-b border-slate-200 dark:border-border/60 my-2.5 flex items-center gap-2">
              <Sparkles className="size-4 text-primary shrink-0" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-300 tracking-tight pb-1.5 border-b border-teal-200 dark:border-teal-500/20 my-3 flex items-center gap-1.5 bg-teal-50/50 dark:bg-teal-500/5 px-2.5 py-1 rounded-lg">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-[0.8rem] font-bold text-slate-900 dark:text-foreground mt-4 mb-2 flex items-center gap-2 text-primary">
              <span className="size-2 rounded-full bg-primary shrink-0" />
              <span className="font-bold">{children}</span>
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[0.74rem] font-bold text-slate-800 dark:text-slate-200 mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="text-primary font-mono text-[0.65rem]">■</span>
              <span>{children}</span>
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[0.76rem] sm:text-[0.78rem] text-slate-800 dark:text-slate-200 leading-relaxed my-1.5 first:mt-0 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => {
            const str = String(children);
            // Render specific badges for severities
            if (str.includes("CRITICAL") || str.includes("حرج")) {
              return (
                <Badge className="bg-red-100 text-red-900 border-red-300 dark:bg-red-500/20 dark:text-red-400 font-bold mx-1 text-[0.65rem] py-0 px-1.5 shadow-2xs">
                  {children}
                </Badge>
              );
            }
            if (str.includes("WARNING") || str.includes("تحذير")) {
              return (
                <Badge className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 font-bold mx-1 text-[0.65rem] py-0 px-1.5 shadow-2xs">
                  {children}
                </Badge>
              );
            }
            if (str.includes("INFO") || str.includes("معلوماتي")) {
              return (
                <Badge className="bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-500/20 dark:text-sky-300 font-bold mx-1 text-[0.65rem] py-0 px-1.5 shadow-2xs">
                  {children}
                </Badge>
              );
            }
            return <strong className="font-bold text-slate-950 dark:text-white">{children}</strong>;
          },
          ul: ({ children }) => (
            <ul className="list-disc list-outside ms-4 space-y-1.5 my-2.5 text-[0.75rem] text-slate-800 dark:text-slate-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ms-4 space-y-1.5 my-2.5 text-[0.75rem] text-slate-800 dark:text-slate-200">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed ps-0.5">{children}</li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-3.5 rounded-xl border border-slate-200 dark:border-border/80 bg-white dark:bg-card shadow-xs">
              <table className="w-full text-[0.72rem] text-start border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 dark:bg-muted/70 text-slate-900 dark:text-muted-foreground font-bold border-b border-slate-200 dark:border-border">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 dark:divide-border/40">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/70 dark:hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2.5 px-3 text-start font-bold text-slate-900 dark:text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-2.5 px-3 text-start text-slate-700 dark:text-slate-200 font-medium">
              {children}
            </td>
          ),
          blockquote: ({ children }) => (
            <div className="border-s-4 border-s-teal-600 dark:border-s-teal-400 bg-teal-50/90 dark:bg-teal-500/10 p-3 rounded-e-xl my-3 text-[0.74rem] text-teal-950 dark:text-teal-200 shadow-2xs flex items-start gap-2">
              <ShieldAlert className="size-4 shrink-0 text-teal-700 dark:text-teal-400 mt-0.5" />
              <div className="flex-1 leading-relaxed">{children}</div>
            </div>
          ),
          code: ({ children, className }) => {
            const isCodeBlock = String(className || "").includes("language-");
            if (isCodeBlock) {
              return (
                <div className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[0.7rem] overflow-x-auto my-2 border border-slate-800">
                  <code>{children}</code>
                </div>
              );
            }
            return (
              <code className="font-mono text-[0.7rem] bg-slate-100 dark:bg-muted px-1.5 py-0.5 rounded text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-border font-semibold">
                {children}
              </code>
            );
          },
          hr: () => (
            <hr className="border-slate-200 dark:border-border/60 my-3.5" />
          ),
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
