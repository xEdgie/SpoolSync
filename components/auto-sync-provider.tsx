/** @format */

"use client";

import { useEffect, useRef } from "react";
import { FilamentProfile } from "@/types/profile";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { generateFilamentJson } from "@/lib/orcaslicer";

export function AutoSyncProvider() {
	const { user } = useAuth();
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const lastSyncedProfilesRef = useRef<string>("");

	useEffect(() => {
		if (!user || !window.electron) return;

		// Check if auto-sync is enabled
		const autoSyncEnabled =
			localStorage.getItem("autoSyncEnabled") === "true";
		console.log("Auto-sync enabled:", autoSyncEnabled);
		if (!autoSyncEnabled) return;

		const q = query(collection(db, "users", user.uid, "filaments"));
		const unsubscribe = onSnapshot(q, async (querySnapshot) => {
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
					flowRatio: p.flowRatio,
					initialNozzleTemp: p.initialNozzleTemp,
					nozzleTemp: p.nozzleTemp,
					initialBedTemp: p.initialBedTemp,
					bedTemp: p.bedTemp,
					printerId: p.printerId,
					printerName: p.printerName,
          retractionLength: p.retractionLength,
          zhopHeight: p.zhopHeight,
          zhopType: p.zhopType,
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
				targetDir = baseDir;
			}

			// Get list of existing SpoolSync files
			const existingFiles = await window.electron.readDir(targetDir);
			const existingSpoolSyncFiles = existingFiles.filter(
				(f) => f.startsWith("SpoolSync") && f.endsWith(".json")
			);

			// Create set of expected filenames based on current profiles
			const expectedFiles = new Set(
				profiles.map(
					(profile) =>
						`SpoolSync ${profile.brand} ${profile.type}.json`
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
					console.log(`Deleted orphaned file: ${existingFile}`);
				}
			}

			// Write/update all current profile files
			for (const profile of profiles) {
				const jsonContent = generateFilamentJson(profile);
				const fileName = `SpoolSync ${profile.brand} ${profile.type}.json`;
				const filePath = await window.electron.joinPath(
					targetDir,
					fileName
				);

				await window.electron.writeFile(filePath, jsonContent);
			}

			// Update last sync time in localStorage
			localStorage.setItem("lastSyncTime", new Date().toISOString());

			console.log(
				`✅ Auto-synced ${profiles.length} profiles to ${targetDir}`
			);
		} catch (error) {
			console.error("❌ Auto-sync failed:", error);
		}
	};

	// This component doesn't render anything
	return null;
}
