"use client";

import { useState, useEffect } from "react";
import { FilamentProfile } from "@/types/filament";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { generateFilamentJson } from "@/lib/orcaslicer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Printer } from "@/types/printer";
import { generatePrinterJson } from "@/lib/orcaslicer";

export function SyncView() {
  const [profiles, setProfiles] = useState<FilamentProfile[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [localFiles, setLocalFiles] = useState<string[]>([]);
  const [localPrinterFiles, setLocalPrinterFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { user } = useAuth();

  const fetchLocalFiles = async () => {
    if (window.electron) {
      try {
        const homeDir = await window.electron.getHomeDir();
        const baseDir =
          localStorage.getItem("orcaSlicerPath") ||
          `${homeDir}/Library/Application Support/OrcaSlicer`;

        // 1. Fetch Local Filaments
        let targetDir = await window.electron.joinPath(
          baseDir,
          "user",
          "default",
          "filament"
        );
        let exists = await window.electron.checkDirExists(targetDir);

        if (!exists) {
          targetDir = baseDir;
        }

        const files = await window.electron.readDir(targetDir);
        setLocalFiles(files.filter((f) => f.endsWith(".json")));

        // 2. Fetch Local Printers (Machines)
        let printerTargetDir = await window.electron.joinPath(
          baseDir,
          "user",
          "default",
          "machine"
        );
        let printerDirExists = await window.electron.checkDirExists(
          printerTargetDir
        );

        if (printerDirExists) {
          const pFiles = await window.electron.readDir(printerTargetDir);
          setLocalPrinterFiles(pFiles.filter((f) => f.endsWith(".json")));
        }
      } catch (error) {
        console.error("Failed to read local files:", error);
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    // Load auto-sync preference from localStorage
    const savedAutoSync = localStorage.getItem("autoSyncEnabled");
    if (savedAutoSync === "true") {
      setAutoSyncEnabled(true);
    }

    // Load last sync time from localStorage
    const savedLastSyncTime = localStorage.getItem("lastSyncTime");
    if (savedLastSyncTime) {
      setLastSyncTime(new Date(savedLastSyncTime));
    }

    // Poll for last sync time updates every second
    const pollInterval = setInterval(() => {
      const currentLastSyncTime = localStorage.getItem("lastSyncTime");
      if (currentLastSyncTime) {
        setLastSyncTime(new Date(currentLastSyncTime));
      }
    }, 1000);

    // Subscribe to Filaments
    const qFilaments = query(collection(db, "users", user.uid, "filaments"));
    const unsubscribeFilaments = onSnapshot(qFilaments, (querySnapshot) => {
      const profilesData: FilamentProfile[] = [];
      querySnapshot.forEach((doc) => {
        profilesData.push({ id: doc.id, ...doc.data() } as FilamentProfile);
      });
      setProfiles(profilesData);
    });

    // Subscribe to Printers
    const qPrinters = query(collection(db, "users", user.uid, "printers"));
    const unsubscribePrinters = onSnapshot(qPrinters, (querySnapshot) => {
      const printersData: Printer[] = [];
      querySnapshot.forEach((doc) => {
        printersData.push({ id: doc.id, ...doc.data() } as Printer);
      });
      setPrinters(printersData);
      setIsLoading(false); // Enable UI once we have data
    });

    fetchLocalFiles();

    return () => {
      unsubscribeFilaments();
      unsubscribePrinters();
      clearInterval(pollInterval);
    };
  }, [user]);

  const performSync = async (
    profilesToSync: FilamentProfile[] = profiles,
    printersToSync: Printer[] = printers,
    showStatus: boolean = false
  ) => {
    if (!window.electron) return;

    if (showStatus) {
      setIsSyncing(true);
      setSyncStatus(null);
    }

    try {
      const homeDir = await window.electron.getHomeDir();
      const baseDir =
        localStorage.getItem("orcaSlicerPath") ||
        `${homeDir}/Library/Application Support/OrcaSlicer`;

      // --- SYNC FILAMENTS ---
      let targetDir = await window.electron.joinPath(
        baseDir,
        "user",
        "default",
        "filament"
      );
      let exists = await window.electron.checkDirExists(targetDir);

      if (!exists) {
        targetDir = baseDir;
      }

      // Cleanup orphaned filaments
      const existingFiles = await window.electron.readDir(targetDir);
      const existingSpoolSyncFiles = existingFiles.filter(
        (f) => f.startsWith("SpoolSync") && f.endsWith(".json")
      );
      const expectedFiles = new Set(
        profilesToSync.map(
          (profile) => `SpoolSync ${profile.brand} ${profile.type}.json`
        )
      );

      let deletedCount = 0;
      for (const existingFile of existingSpoolSyncFiles) {
        if (!expectedFiles.has(existingFile)) {
          const filePath = await window.electron.joinPath(
            targetDir,
            existingFile
          );
          const deleted = await window.electron.deleteFile(filePath);
          if (deleted) deletedCount++;
        }
      }

      // Write filament profiles
      let successCount = 0;
      for (const profile of profilesToSync) {
        const mockPrinter = { name: profile.printerName || "Generic" } as any;
        const jsonContent = generateFilamentJson(profile, mockPrinter);
        const fileName = `SpoolSync ${profile.brand} ${profile.type}.json`;
        const filePath = await window.electron.joinPath(targetDir, fileName);

        const written = await window.electron.writeFile(filePath, jsonContent);
        if (written) successCount++;
      }

      // --- SYNC PRINTERS ---
      let printerTargetDir = await window.electron.joinPath(
        baseDir,
        "user",
        "default",
        "machine"
      );
      let printerDirExists = await window.electron.checkDirExists(
        printerTargetDir
      );

      let printerSuccessCount = 0;
      let printerDeletedCount = 0;

      if (printerDirExists) {
        const existingPFiles = await window.electron.readDir(printerTargetDir);
        const existingSpoolSyncPFiles = existingPFiles.filter(
          (f) => f.startsWith("SpoolSync") && f.endsWith(".json")
        );
        const expectedPFiles = new Set(
          printersToSync.map((p) => `SpoolSync ${p.name}.json`)
        );

        // Cleanup orphaned printers
        for (const existingFile of existingSpoolSyncPFiles) {
          if (!expectedPFiles.has(existingFile)) {
            const filePath = await window.electron.joinPath(
              printerTargetDir,
              existingFile
            );
            const deleted = await window.electron.deleteFile(filePath);
            if (deleted) printerDeletedCount++;
          }
        }

        // Write printer profiles
        for (const printer of printersToSync) {
          const jsonContent = generatePrinterJson(printer);
          const fileName = `SpoolSync ${printer.name}.json`;
          const filePath = await window.electron.joinPath(
            printerTargetDir,
            fileName
          );
          const written = await window.electron.writeFile(
            filePath,
            jsonContent
          );
          if (written) printerSuccessCount++;
        }
      }

      if (showStatus) {
        setSyncStatus({
          success: true,
          message: `Synced ${successCount} filaments and ${printerSuccessCount} printers.`,
        });
      }

      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem("lastSyncTime", now.toISOString());
      await fetchLocalFiles();
    } catch (error) {
      console.error("Sync failed:", error);
      if (showStatus) {
        setSyncStatus({
          success: false,
          message: "Failed to sync. Check console.",
        });
      }
    } finally {
      if (showStatus) {
        setIsSyncing(false);
      }
    }
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    localStorage.setItem("autoSyncEnabled", enabled.toString());

    if (enabled) {
      // Immediately sync when enabling
      performSync(profiles, printers, false);
    }
  };

  const handleSync = async () => {
    await performSync(profiles, printers, true);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sync Profiles</h2>
          <p className="text-muted-foreground">
            Sync your cloud profiles to your local OrcaSlicer configuration.
          </p>
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground mt-1">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-sync"
              checked={autoSyncEnabled}
              onCheckedChange={handleAutoSyncToggle}
            />
            <Label
              htmlFor="auto-sync"
              className="flex items-center gap-1 cursor-pointer"
            >
              <Zap
                className={`h-4 w-4 ${
                  autoSyncEnabled ? "text-primary" : "text-muted-foreground"
                }`}
              />
              Auto-Sync
            </Label>
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Manual Sync"}
          </Button>
        </div>
      </div>

      {syncStatus && (
        <div
          className={`p-4 rounded-md flex items-center gap-2 ${
            syncStatus.success
              ? "bg-green-500/15 text-green-600"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {syncStatus.success ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {syncStatus.message}
        </div>
      )}

      <Accordion
        type="single"
        collapsible
        defaultValue="filaments"
        className="w-full"
      >
        {/* PRINTERS ACCORDION ITEM */}
        <AccordionItem value="printers">
          <AccordionTrigger className="text-lg font-semibold">
            Printers
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cloud Profiles</CardTitle>
                  <CardDescription>
                    All of your synced printer profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Nozzle</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {printers.map((printer) => (
                        <TableRow key={printer.id}>
                          <TableCell className="font-medium">
                            {printer.name}
                          </TableCell>
                          <TableCell>{printer.model}</TableCell>
                          <TableCell>{printer.nozzleDiameter}mm</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Files</CardTitle>
                  <CardDescription>
                    Printer files in your OrcaSlicer directory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localPrinterFiles.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-muted-foreground text-center py-8">
                            No local JSON files found
                          </TableCell>
                        </TableRow>
                      ) : (
                        localPrinterFiles.map((file, i) => (
                          <TableRow key={i}>
                            <TableCell className="flex items-center gap-2">
                              <FileJson className="h-4 w-4 text-muted-foreground" />
                              {file}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* FILAMENTS ACCORDION ITEM */}
        <AccordionItem value="filaments">
          <AccordionTrigger className="text-lg font-semibold">
            Filaments
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4 md:grid-cols-2 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Cloud Profiles</CardTitle>
                  <CardDescription> 
                    All of your synced filament profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Color</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>{profile.brand}</TableCell>
                          <TableCell>{profile.type}</TableCell>
                          <TableCell>
                            <div
                              className="h-4 w-4 rounded-full border"
                              style={{ backgroundColor: profile.color }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Files</CardTitle>
                  <CardDescription>
                    Filament files in your OrcaSlicer directory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filename</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {localFiles.length === 0 ? (
                        <TableRow>
                          <TableCell className="text-muted-foreground text-center py-8">
                            No local JSON files found
                          </TableCell>
                        </TableRow>
                      ) : (
                        localFiles.map((file, i) => (
                          <TableRow key={i}>
                            <TableCell className="flex items-center gap-2">
                              <FileJson className="h-4 w-4 text-muted-foreground" />
                              {file}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
