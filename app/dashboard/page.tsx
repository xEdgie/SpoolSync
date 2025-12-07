/** @format */

"use client";

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProfileGrid } from "@/components/filament-grid";
import { PrinterGrid } from "@/components/printer-grid";
import { SyncView } from "@/components/sync-view";
import { TuningView } from "@/components/tuning-view";
import { AutoSyncProvider } from "@/components/auto-sync-provider";
import { FilamentProfile } from "@/types/filament";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const MOCK_DATA: FilamentProfile[] = [];

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "filament";
  const [data, setData] = useState<FilamentProfile[]>(MOCK_DATA);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentView, setCurrentView] = useState(view);

  // Handle view transitions with a brief loading state
  useEffect(() => {
    if (view !== currentView) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentView(view);
        setIsTransitioning(false);
      }, 50); // Brief delay to prevent flash
      return () => clearTimeout(timer);
    }
  }, [view, currentView]);

  const renderView = () => {
    if (isTransitioning) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      );
    }

    switch (currentView) {
      case "printers":
        return <PrinterGrid />;
      case "sync":
        return <SyncView />;
      case "tune":
        return <TuningView />;
      default:
        return <ProfileGrid data={data} setData={setData} />;
    }
  };

  const getBreadcrumbTitle = () => {
    switch (currentView) {
      case "printers":
        return "Printers";
      case "sync":
        return "Sync";
      case "tune":
        return "Tune";
      default:
        return "Filaments";
    }
  };

  return (
    <SidebarProvider>
      <AutoSyncProvider />
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{getBreadcrumbTitle()}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
          {renderView()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Page() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
