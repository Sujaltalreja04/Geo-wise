"use client";

import * as React from "react";
import {
  Search,
  Sun,
  Moon,
  Languages,
  Bell,
  ChevronDown,
  UserCircle,
  LogOut,
  Settings,
  ShieldCheck,
  Radio,
  Command,
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { useGeoWiseStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ALERTS } from "@/lib/dummy-data";

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const lang = useGeoWiseStore((s) => s.lang);
  const toggleLang = useGeoWiseStore((s) => s.toggleLang);
  const t = useGeoWiseStore((s) => s.t);
  const user = useGeoWiseStore((s) => s.user);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const unackAlerts = ALERTS.filter((a) => !a.acknowledged).length;

  const initials =
    lang === "ar"
      ? "خ ع"
      : user.name
          .split(" ")
          .slice(0, 2)
          .map((s) => s[0])
          .join("")
          .toUpperCase();

  return (
    <header className="h-16 shrink-0 border-b border-border/70 bg-card/70 backdrop-blur-xl sticky top-0 z-30 shadow-xs transition-colors">
      <div className="h-full px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left Side: Brand Context & Telemetry Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col leading-tight me-2">
            <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground font-mono font-bold">
              GeoWise · Enterprise
            </span>
            <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
              {lang === "ar" ? user.tenantNameAr : user.tenantName}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground font-semibold">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            <span className="text-muted-foreground font-medium">MOMRAH Cloud:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-mono font-bold">Operational (18ms)</span>
          </div>
        </div>

        {/* Center: Command Search Bar */}
        <div className="relative flex-1 max-w-lg mx-2">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={
              lang === "ar"
                ? "ابحث في الطبقات، القضايا، الاكتشافات، أو اضغط ⌘K..."
                : "Search datasets, cases, detections, or press ⌘K..."
            }
            className="ps-9 pe-12 h-9.5 bg-background border-border hover:border-border/80 focus-visible:border-primary text-xs font-medium rounded-xl shadow-xs transition-all placeholder:text-muted-foreground/80"
          />
          <div className="absolute end-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border/60 bg-muted/70 text-[0.62rem] font-mono text-muted-foreground pointer-events-none">
            <Command className="size-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* Live Alert Bell */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative size-9 rounded-xl hover:bg-muted/80 transition-transform active:scale-95"
                aria-label="notifications"
              >
                <Bell className="size-4 text-foreground/80" />
                {unackAlerts > 0 && (
                  <span className="absolute top-1.5 end-1.5 size-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-2xl shadow-xl border-border/70 p-2">
              <DropdownMenuLabel className="flex items-center justify-between pb-2 mb-1 border-b">
                <span className="font-bold text-xs">{t("mod.monitoring")}</span>
                <Badge variant="destructive" className="text-[0.65rem] font-mono px-2 py-0">
                  {unackAlerts} {lang === "ar" ? "تنبيه نشط" : "unacknowledged"}
                </Badge>
              </DropdownMenuLabel>
              {ALERTS.slice(0, 4).map((a) => (
                <DropdownMenuItem
                  key={a.id}
                  className="flex flex-col items-start gap-1 p-2 rounded-xl focus:bg-muted/70 cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        a.severity === "critical"
                          ? "bg-red-500 animate-ping"
                          : a.severity === "warning"
                          ? "bg-amber-500"
                          : "bg-teal-500"
                      )}
                    />
                    <span className="text-xs font-semibold flex-1 truncate text-foreground">
                      {lang === "ar" ? a.messageAr : a.message}
                    </span>
                  </div>
                  <span className="text-[0.65rem] text-muted-foreground ps-4 font-mono">
                    {new Date(a.triggeredAt).toLocaleString(
                      lang === "ar" ? "ar-SA" : "en-GB",
                      { dateStyle: "short", timeStyle: "short" }
                    )}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-xl hover:bg-muted/80 transition-transform active:scale-95"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t("common.theme")}
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-4 text-amber-400" />
            ) : (
              <Moon className="size-4 text-slate-700" />
            )}
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="gap-1.5 h-9 px-2.5 rounded-xl font-bold text-xs hover:bg-muted/80 transition-transform active:scale-95"
            aria-label={t("common.language")}
          >
            <Languages className="size-3.5 text-primary" />
            <span>{lang === "ar" ? "عربي" : "EN"}</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-9 ps-1 pe-2.5 rounded-full hover:bg-muted/60 transition-all border border-border/50">
                <Avatar className="size-7 ring-2 ring-primary/30">
                  <AvatarFallback className="bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-foreground">
                    {lang === "ar" ? user.nameAr : user.name}
                  </span>
                  <span className="text-[0.62rem] text-muted-foreground capitalize font-mono">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="size-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-xl border-border/70 p-2">
              <DropdownMenuLabel className="p-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-foreground">
                    {lang === "ar" ? user.nameAr : user.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {user.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="px-2 py-1.5 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("common.tenant")}</span>
                  <span className="font-semibold truncate ms-2 max-w-[140px]">
                    {lang === "ar" ? user.tenantNameAr : user.tenantName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("common.role")}</span>
                  <span className="font-semibold capitalize text-primary font-mono">{user.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3 text-emerald-500" />
                    {lang === "ar" ? "الصلاحيات" : "Permissions"}
                  </span>
                  <span className="font-mono text-xs">
                    {user.permissions.length} {lang === "ar" ? "صلاحيات" : "perms"}
                  </span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-xl cursor-pointer">
                <UserCircle className="size-4 me-2 text-primary" />
                {t("common.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl cursor-pointer">
                <Settings className="size-4 me-2 text-primary" />
                {t("common.settings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive rounded-xl cursor-pointer">
                <LogOut className="size-4 me-2" />
                {t("common.signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
