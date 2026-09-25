"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGeoWiseStore } from "@/stores/app-store";

/** Applies `dir` and `lang` on <html> reactively from the global app store. */
function DirectionManager({ children }: { children: React.ReactNode }) {
  const lang = useGeoWiseStore((s) => s.lang);

  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
  }, [lang]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <DirectionManager>{children}</DirectionManager>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
