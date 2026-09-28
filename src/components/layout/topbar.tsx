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

  const initials = lang === "ar"
    ? "خ ع"
    : (user.name.split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase());

  return (
    <header className="h-16 shrink-0 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        {/* Module title */}
        <div className="hidden lg:flex flex-col leading-tight me-2">
          <span className="text-[0.7rem] uppercase tracking-wider text-muted-foreground font-semibold">
            GeoWise · MVP
          </span>
          <span className="text-sm font-medium text-foreground">
            {lang === "ar" ? user.tenantNameAr : user.tenantName}
          </span>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={t("common.search") + "…"}
            className="ps-9 h-9 bg-muted/40 border-transparent focus-visible:bg-background focus-visible:border-border"
          />
        </div>

        {/* Live alert bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative size-9"
              aria-label="notifications"
            >
              <Bell className="size-4" />
              {unackAlerts > 0 && (
                <span className="absolute top-1 end-1 size-2 rounded-full bg-chart-5 ring-2 ring-background" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{t("mod.monitoring")}</span>
              <Badge variant="secondary" className="text-[0.65rem]">
                {unackAlerts} {lang === "ar" ? "غير معتمد" : "unack"}
              </Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ALERTS.slice(0, 4).map((a) => (
              <DropdownMenuItem
                key={a.id}
                className="flex flex-col items-start gap-0.5 py-2"
              >
                <div className="flex items-center gap-2 w-full">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      a.severity === "critical"
                        ? "bg-chart-5"
                        : a.severity === "warning"
                          ? "bg-chart-4"
                          : "bg-chart-2"
                    )}
                  />
                  <span className="text-xs font-medium flex-1 truncate">
                    {lang === "ar" ? a.messageAr : a.message}
                  </span>
                </div>
                <span className="text-[0.65rem] text-muted-foreground ps-3.5">
                  {new Date(a.triggeredAt).toLocaleString(
                    lang === "ar" ? "ar-SA" : "en-GB",
                    { dateStyle: "short", timeStyle: "short" }
                  )}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={t("common.theme")}
        >
          {mounted && theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>

        {/* Language toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLang}
          className="gap-1.5 h-9 px-3 font-semibold"
          aria-label={t("common.language")}
        >
          <Languages className="size-4" />
          <span className="text-xs">{lang === "ar" ? "ع" : "EN"}</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 h-9 ps-1 pe-3 rounded-full hover:bg-muted/60 transition-colors">
              <Avatar className="size-8 ring-1 ring-border">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">
                  {lang === "ar" ? user.nameAr : user.name}
                </span>
                <span className="text-[0.65rem] text-muted-foreground capitalize">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {lang === "ar" ? user.nameAr : user.name}
                </span>
                <span className="text-[0.7rem] text-muted-foreground font-normal">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("common.tenant")}</span>
                <span className="font-medium truncate ms-2 max-w-[140px]">
                  {lang === "ar" ? user.tenantNameAr : user.tenantName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("common.role")}</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3" />
                  {lang === "ar" ? "الصلاحيات" : "Permissions"}
                </span>
                <span className="font-medium">
                  {user.permissions.length} {lang === "ar" ? "صلاحية" : "perms"}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="size-4 me-2" />
              {t("common.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4 me-2" />
              {t("common.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="size-4 me-2" />
              {t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
