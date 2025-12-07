/** @format */

"use client";

import { useEffect, useRef } from "react";
import { FilamentProfile } from "@/types/filament";
import { Printer } from "@/types/printer";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { generateFilamentJson, generatePrinterJson } from "@/lib/orcaslicer";

export function AutoSyncProvider() {
  const { user } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedProfilesRef = useRef<string>("");

  useEffect(() => {
    if (!user || !window.electron) return;

    const q = query(collection(db, "users", user.uid, "filaments"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      // Check if auto-sync is enabled inside the callback
      const autoSyncEnabled =
        localStorage.getItem("autoSyncEnabled") === "true";
      if (!autoSyncEnabled) {
        console.log("Auto-sync is disabled, skipping sync");
        return;
      }
      const profiles: FilamentProfile[] = [];
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() } as FilamentProfile);
      });

      // Create a hash of current profiles to detect changes
      const profilesHash = JSON.stringify(
        profiles.map((p) => ({
          id: p.id,
          brand: p.brand,
          type: p.type,
          color: p.color,
          costPerKg: p.costPerKg,
          isSupportMaterial: p.isSupportMaterial,
          diameter: p.diameter,
          density: p.density,
          shrinkageXY: p.shrinkageXY,
          shrinkageZ: p.shrinkageZ,
          nozzleTempRangeLow: p.nozzleTempRangeLow,
          nozzleTempRangeHigh: p.nozzleTempRangeHigh,
          flowRatio: p.flowRatio,
          enablePressureAdvance: p.enablePressureAdvance,
          pressureAdvance: p.pressureAdvance,
          chamberTemp: p.chamberTemp,
          chamberTempControl: p.chamberTempControl,
          initialNozzleTemp: p.initialNozzleTemp,
          nozzleTemp: p.nozzleTemp,
          initialBedTemp: p.initialBedTemp,
          bedTemp: p.bedTemp,
          fanSpeedMin: p.fanSpeedMin,
          fanSpeedMax: p.fanSpeedMax,
          minFanSpeedLayerTime: p.minFanSpeedLayerTime,
          printerId: p.printerId,
          printerName: p.printerName,
          enableRetraction: p.enableRetraction,
          retractionLength: p.retractionLength,
          zhopHeight: p.zhopHeight,
          zhopType: p.zhopType,
          enableRetractionLiftAbove: p.enableRetractionLiftAbove,
          zhopLiftAbove: p.retractLiftAbove,
          enableRetractionLiftBelow: p.enableRetractionLiftBelow,
          zhopLiftBelow: p.retractLiftBelow,
        }))
      );

      // Only sync if profiles actually changed
      if (profilesHash === lastSyncedProfilesRef.current) {
        console.log("No changes detected, skipping sync");
        return;
      }

      console.log("Profile changes detected, scheduling sync...");

      lastSyncedProfilesRef.current = profilesHash;

      // Debounce the sync operation
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(async () => {
        await performSync(profiles);
      }, 1000); // 1 second debounce
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user]);

  const performSync = async (profiles: FilamentProfile[]) => {
    if (!window.electron) return;

    try {
      const homeDir = await window.electron.getHomeDir();
      const baseDir =
        localStorage.getItem("orcaSlicerPath") ||
        `${homeDir}/Library/Application Support/OrcaSlicer`;
      let targetDir = await window.electron.joinPath(
        baseDir,
        "user",
        "default",
        "filament"
      );
      const exists = await window.electron.checkDirExists(targetDir);

      if (!exists) {
        targetDir = baseDir; // Fallback, likely won't work well but prevents crash
      }

      // Get list of existing SpoolSync files
      const existingFiles = await window.electron.readDir(targetDir);
      const existingSpoolSyncFiles = existingFiles.filter(
        (f) => f.startsWith("SpoolSync") && f.endsWith(".json")
      );

      // Create set of expected filenames based on current profiles
      const expectedFiles = new Set(
        profiles.map(
          (profile) => `SpoolSync ${profile.brand} ${profile.type}.json`
        )
      );

      // Delete orphaned files (files that exist but shouldn't)
      for (const existingFile of existingSpoolSyncFiles) {
        if (!expectedFiles.has(existingFile)) {
          const filePath = await window.electron.joinPath(
            targetDir,
            existingFile
          );
          await window.electron.deleteFile(filePath);
          console.log(`Deleted orphaned filament file: ${existingFile}`);
        }
      }

      // Write/update all current profile files
      for (const profile of profiles) {
        // We need a dummy printer object here or modify generateFilamentJson to not require it
        // For now, passing a partial mock since generateFilamentJson primarily uses printerName which is on profile
        const mockPrinter = { name: profile.printerName || "Generic" } as any;
        const jsonContent = generateFilamentJson(profile, mockPrinter);
        const fileName = `SpoolSync ${profile.brand} ${profile.type}.json`;
        const filePath = await window.electron.joinPath(targetDir, fileName);

        await window.electron.writeFile(filePath, jsonContent);
      }

      // Update last sync time in localStorage
      localStorage.setItem("lastSyncTime", new Date().toISOString());

      console.log(
        `✅ Auto-synced ${profiles.length} filament profiles to ${targetDir}`
      );
    } catch (error) {
      console.error("❌ Auto-sync failed:", error);
    }
  };

  // --- PRINTER SYNC LOGIC ---
  const printerSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedPrintersRef = useRef<string>("");

  useEffect(() => {
    if (!user || !window.electron) return;

    const q = query(collection(db, "users", user.uid, "printers"));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const autoSyncEnabled =
        localStorage.getItem("autoSyncEnabled") === "true";
      if (!autoSyncEnabled) return;

      const printers: Printer[] = [];
      querySnapshot.forEach((doc) => {
        printers.push({ id: doc.id, ...doc.data() } as Printer);
      });

      const printersHash = JSON.stringify(printers);

      if (printersHash === lastSyncedPrintersRef.current) return;

      console.log("Printer changes detected, scheduling sync...");
      lastSyncedPrintersRef.current = printersHash;

      if (printerSyncTimeoutRef.current) {
        clearTimeout(printerSyncTimeoutRef.current);
      }

      printerSyncTimeoutRef.current = setTimeout(async () => {
        await performPrinterSync(printers);
      }, 1000);
    });

    return () => {
      unsubscribe();
      if (printerSyncTimeoutRef.current)
        clearTimeout(printerSyncTimeoutRef.current);
    };
  }, [user]);

  const performPrinterSync = async (printers: Printer[]) => {
    if (!window.electron) return;
    try {
      const homeDir = await window.electron.getHomeDir();
      const baseDir =
        localStorage.getItem("orcaSlicerPath") ||
        `${homeDir}/Library/Application Support/OrcaSlicer`;

      // Machine profiles go into 'machine' folder (sometimes it's 'printer', checking typically 'machine' in Orca/Bambu)
      // OrcaSlicer structure: user/default/machine
      let targetDir = await window.electron.joinPath(
        baseDir,
        "user",
        "default",
        "machine"
      );

      // Ensure directory exists
      const exists = await window.electron.checkDirExists(targetDir);
      if (!exists) {
        console.warn("Target machine directory does not exist:", targetDir);
        return;
      }

      const existingFiles = await window.electron.readDir(targetDir);
      const existingSpoolSyncFiles = existingFiles.filter(
        (f) => f.startsWith("SpoolSync") && f.endsWith(".json")
      );

      const expectedFiles = new Set(
        printers.map((p) => `SpoolSync ${p.name}.json`)
      );

      // Delete orphans
      for (const existingFile of existingSpoolSyncFiles) {
        if (!expectedFiles.has(existingFile)) {
          await window.electron.deleteFile(
            await window.electron.joinPath(targetDir, existingFile)
          );
          console.log(`Deleted orphaned printer file: ${existingFile}`);
        }
      }

      // Update files
      for (const printer of printers) {
        const jsonContent = generatePrinterJson(printer);
        const fileName = `SpoolSync ${printer.name}.json`;
        await window.electron.writeFile(
          await window.electron.joinPath(targetDir, fileName),
          jsonContent
        );
      }

      console.log(`✅ Auto-synced ${printers.length} printer profiles`);
    } catch (error) {
      console.error("❌ Printer auto-sync failed:", error);
    }
  };

  return null;
}
