"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Globe } from "lucide-react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Footer } from "./footer";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useGeoWiseStore, type ModuleId } from "@/stores/app-store";
import { cn } from "@/lib/utils";

/**
 * Mobile drawer version of the sidebar.
 * Renders inside a Sheet so it can be opened on small screens.
 */
function MobileSidebar() {
  const [open, setOpen] = React.useState(false);
  const t = useGeoWiseStore((s) => s.t);
  const brand = useGeoWiseStore((s) => s.user.tenantName);
  const lang = useGeoWiseStore((s) => s.lang);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-9"
          aria-label="menu"
        >
          <Menu className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side={lang === "ar" ? "right" : "left"}
        className="w-72 p-0 bg-sidebar text-sidebar-foreground border-e-0"
      >
        <SheetTitle className="sr-only">{t("brand.name")}</SheetTitle>
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="grid place-items-center size-9 rounded-lg bg-primary/15 ring-1 ring-primary/30 text-primary">
            <Globe className="size-5" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-sm">{t("brand.name")}</div>
            <div className="text-[0.7rem] text-sidebar-foreground/60 truncate">
              {brand}
            </div>
          </div>
        </div>
        <div onClick={() => setOpen(false)} className="h-[calc(100%-4rem)]">
          <MobileSidebarNav onSelect={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

/** A simpler nav list rendered inside the mobile sheet. */
function MobileSidebarNav({ onSelect }: { onSelect: () => void }) {
  const pathname = usePathname();
  const setActive = useGeoWiseStore((s) => s.setActiveModule);
  const t = useGeoWiseStore((s) => s.t);

  const navItems = [
    ["dashboard", "mod.dashboard"],
    ["map", "mod.map"],
    ["catalog", "mod.catalog"],
    ["analysis", "mod.analysis"],
    ["detections", "mod.detections"],
    ["monitoring", "mod.monitoring"],
    ["cases", "mod.cases"],
    ["assistant", "mod.assistant"],
    ["audit", "mod.audit"],
    ["admin", "mod.admin"],
  ] as const;

  return (
    <nav className="p-3 overflow-y-auto h-full scrollbar-thin">
      <p className="px-3 py-2 text-[0.7rem] uppercase tracking-wider text-sidebar-foreground/55 font-semibold">
        {t("nav.group.workspace")} / {t("nav.group.operations")}
      </p>
      {navItems.map(([id, label]) => {
        const href = `/${id}`;
        const isActive =
          pathname === href || (pathname === "/" && id === "dashboard");

        return (
          <Link
            key={id}
            href={href}
            onClick={() => {
              setActive(id as ModuleId);
              onSelect();
            }}
            className={cn(
              "block w-full text-start px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            {t(label as never)}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const setActive = useGeoWiseStore((s) => s.setActiveModule);

  // Sync active module state with current URL pathname
  React.useEffect(() => {
    const slug = pathname.replace(/^\//, "").split("/")[0] as ModuleId;
    if (slug) {
      setActive(slug);
    } else {
      setActive("dashboard");
    }
  }, [pathname, setActive]);

  const isFullHeight =
    pathname === "/assistant" ||
    pathname === "/map" ||
    pathname.startsWith("/map") ||
    pathname.startsWith("/assistant");

  return (
    <div className="h-screen max-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Topbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <MobileSidebar />
        <Sidebar />
        <main
          className={cn(
            "flex-1 flex flex-col min-w-0 min-h-0 relative",
            isFullHeight ? "overflow-hidden" : "overflow-y-auto"
          )}
        >
          <div className="flex-1 min-h-0 flex flex-col animate-in fade-in-50 duration-200">
            {children}
          </div>
          {!isFullHeight && <Footer />}
        </main>
      </div>
    </div>
  );
}
