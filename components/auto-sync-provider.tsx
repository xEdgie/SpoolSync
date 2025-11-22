"use client"

import { useEffect, useRef } from "react"
import { FilamentProfile } from "@/types/profile"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { generateFilamentJson } from "@/lib/orcaslicer"

export function AutoSyncProvider() {
  const { user } = useAuth()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSyncedProfilesRef = useRef<string>("")

  useEffect(() => {
    if (!user || !window.electron) return

    // Check if auto-sync is enabled
    const autoSyncEnabled = localStorage.getItem("autoSyncEnabled") === "true"
    if (!autoSyncEnabled) return

    const q = query(collection(db, "users", user.uid, "filaments"))
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const profiles: FilamentProfile[] = []
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() } as FilamentProfile)
      })

      // Create a hash of current profiles to detect changes
      const profilesHash = JSON.stringify(
        profiles.map(p => ({ id: p.id, brand: p.brand, type: p.type, color: p.color, costPerKg: p.costPerKg, flowRatio: p.flowRatio }))
      )

      // Only sync if profiles actually changed
      if (profilesHash === lastSyncedProfilesRef.current) {
        return
      }

      lastSyncedProfilesRef.current = profilesHash

      // Debounce the sync operation
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(async () => {
        await performSync(profiles)
      }, 1000) // 1 second debounce
    })

    return () => {
      unsubscribe()
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user])

  const performSync = async (profiles: FilamentProfile[]) => {
    if (!window.electron) return

    try {
      const homeDir = await window.electron.getHomeDir()
      const baseDir = localStorage.getItem("orcaSlicerPath") || `${homeDir}/Library/Application Support/OrcaSlicer`
      let targetDir = await window.electron.joinPath(baseDir, "user", "default", "filament")
      const exists = await window.electron.checkDirExists(targetDir)
      
      if (!exists) {
        targetDir = baseDir
      }

      // Get list of existing test_ files
      const existingFiles = await window.electron.readDir(targetDir)
      const existingTestFiles = existingFiles.filter(f => f.startsWith("test_") && f.endsWith(".json"))

      // Create set of expected filenames based on current profiles
      const expectedFiles = new Set(
        profiles.map(profile => 
          `test_${profile.brand}_${profile.type}.json`.replace(/\s+/g, '_')
        )
      )

      // Delete orphaned files (files that exist but shouldn't)
      for (const existingFile of existingTestFiles) {
        if (!expectedFiles.has(existingFile)) {
          const filePath = await window.electron.joinPath(targetDir, existingFile)
          await window.electron.deleteFile(filePath)
          console.log(`Deleted orphaned file: ${existingFile}`)
        }
      }

      // Write/update all current profile files
      for (const profile of profiles) {
        const jsonContent = generateFilamentJson(profile)
        const fileName = `test_${profile.brand}_${profile.type}.json`.replace(/\s+/g, '_')
        const filePath = await window.electron.joinPath(targetDir, fileName)
        
        await window.electron.writeFile(filePath, jsonContent)
      }

      // Update last sync time in localStorage
      localStorage.setItem("lastSyncTime", new Date().toISOString())
      
      console.log(`Auto-synced ${profiles.length} profiles`)
    } catch (error) {
      console.error("Auto-sync failed:", error)
    }
  }

  // This component doesn't render anything
  return null
}
