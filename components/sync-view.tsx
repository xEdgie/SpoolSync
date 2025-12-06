"use client"

import { useState, useEffect } from "react"
import { FilamentProfile } from "@/types/profile"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { generateFilamentJson } from "@/lib/orcaslicer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RefreshCw, FileJson, CheckCircle2, AlertCircle, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SyncView() {
  const [profiles, setProfiles] = useState<FilamentProfile[]>([])
  const [localFiles, setLocalFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { user } = useAuth()

  const fetchLocalFiles = async () => {
    if (window.electron) {
      try {
        const homeDir = await window.electron.getHomeDir()
        const baseDir = localStorage.getItem("orcaSlicerPath") || `${homeDir}/Library/Application Support/OrcaSlicer`
        // Target directory: [ConfigDir]/user/default/filament
        // If not exists, fallback to baseDir for now or create it? 
        // Let's try to find the correct path.
        
        // Construct path: user/default/filament
        // Note: "default" might be different if user logged in to OrcaSlicer? 
        // For now let's assume "default" or check if "user" dir exists and pick first folder?
        // To keep it simple as per plan: try to use a specific path or just the root if unsure.
        // Plan said: [ConfigDir]/user/default/filament
        
        let targetDir = await window.electron.joinPath(baseDir, "user", "default", "filament")
        const exists = await window.electron.checkDirExists(targetDir)
        
        if (!exists) {
            // Fallback to just the base dir if specific structure not found, or maybe just create it?
            // For safety, let's just list files in baseDir if deep path fails, or maybe user selected the filament folder directly?
            // Let's assume user selected the ROOT OrcaSlicer folder.
            targetDir = baseDir
        }

        const files = await window.electron.readDir(targetDir)
        setLocalFiles(files.filter(f => f.endsWith(".json")))
      } catch (error) {
        console.error("Failed to read local files:", error)
      }
    }
  }

  useEffect(() => {
    if (!user) return

    // Load auto-sync preference from localStorage
    const savedAutoSync = localStorage.getItem("autoSyncEnabled")
    if (savedAutoSync === "true") {
      setAutoSyncEnabled(true)
    }

    // Load last sync time from localStorage
    const savedLastSyncTime = localStorage.getItem("lastSyncTime")
    if (savedLastSyncTime) {
      setLastSyncTime(new Date(savedLastSyncTime))
    }

    // Poll for last sync time updates every second
    const pollInterval = setInterval(() => {
      const currentLastSyncTime = localStorage.getItem("lastSyncTime")
      if (currentLastSyncTime) {
        setLastSyncTime(new Date(currentLastSyncTime))
      }
    }, 1000)

    const q = query(collection(db, "users", user.uid, "filaments"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profilesData: FilamentProfile[] = []
      querySnapshot.forEach((doc) => {
        profilesData.push({ id: doc.id, ...doc.data() } as FilamentProfile)
      })
      setProfiles(profilesData)
      setIsLoading(false)
    })

    fetchLocalFiles()

    return () => {
      unsubscribe()
      clearInterval(pollInterval)
    }
  }, [user])

  const performSync = async (profilesToSync: FilamentProfile[] = profiles, showStatus: boolean = false) => {
    if (!window.electron) return

    if (showStatus) {
      setIsSyncing(true)
      setSyncStatus(null)
    }

    try {
      const homeDir = await window.electron.getHomeDir()
      const baseDir = localStorage.getItem("orcaSlicerPath") || `${homeDir}/Library/Application Support/OrcaSlicer`
      let targetDir = await window.electron.joinPath(baseDir, "user", "default", "filament")
      const exists = await window.electron.checkDirExists(targetDir)
      
      if (!exists) {
        targetDir = baseDir
      }

      // Get list of existing SpoolSync files
      const existingFiles = await window.electron.readDir(targetDir)
      const existingTestFiles = existingFiles.filter(f => f.startsWith("SpoolSync") && f.endsWith(".json"))

      // Create set of expected filenames based on current profiles
      const expectedFiles = new Set(
        profilesToSync.map(profile => 
          `SpoolSync ${profile.brand} ${profile.type}.json`
        )
      )

      // Delete orphaned files (files that exist but shouldn't)
      let deletedCount = 0
      for (const existingFile of existingTestFiles) {
        if (!expectedFiles.has(existingFile)) {
          const filePath = await window.electron.joinPath(targetDir, existingFile)
          const deleted = await window.electron.deleteFile(filePath)
          if (deleted) deletedCount++
        }
      }

      // Write/update all current profile files
      let successCount = 0
      for (const profile of profilesToSync) {
        const jsonContent = generateFilamentJson(profile)
        const fileName = `SpoolSync ${profile.brand} ${profile.type}.json`
        const filePath = await window.electron.joinPath(targetDir, fileName)
        
        const written = await window.electron.writeFile(filePath, jsonContent)
        if (written) successCount++
      }

      if (showStatus) {
        const message = deletedCount > 0 
          ? `Successfully synced and replaced ${successCount} profiles`
          : `Successfully synced ${successCount} profiles`
        setSyncStatus({
          success: true,
          message
        })
      }
      
      const now = new Date()
      setLastSyncTime(now)
      localStorage.setItem("lastSyncTime", now.toISOString())
      await fetchLocalFiles()
    } catch (error) {
      console.error("Sync failed:", error)
      if (showStatus) {
        setSyncStatus({
          success: false,
          message: "Failed to sync profiles. Check console for details."
        })
      }
    } finally {
      if (showStatus) {
        setIsSyncing(false)
      }
    }
  }

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSyncEnabled(enabled)
    localStorage.setItem("autoSyncEnabled", enabled.toString())
    
    if (enabled && profiles.length > 0) {
      // Immediately sync when enabling
      performSync(profiles, false)
    }
  }

  const handleSync = async () => {
    await performSync(profiles, true)
  }

  if (isLoading) {
    return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-64 w-full" /></div>
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
            <Label htmlFor="auto-sync" className="flex items-center gap-1 cursor-pointer">
              <Zap className={`h-4 w-4 ${autoSyncEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
              Auto-Sync
            </Label>
          </div>
          <Button onClick={handleSync} disabled={isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Manual Sync'}
          </Button>
        </div>
      </div>


      {syncStatus && (
        <div className={`p-4 rounded-md flex items-center gap-2 ${syncStatus.success ? 'bg-green-500/15 text-green-600' : 'bg-destructive/15 text-destructive'}`}>
            {syncStatus.success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {syncStatus.message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Cloud Profiles</CardTitle>
                <CardDescription>All of your synced profiles</CardDescription>
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
                        {profiles.map(profile => (
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
                <CardDescription>Files in your OrcaSlicer directory</CardDescription>
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
                                <TableCell className="text-muted-foreground text-center py-8">No JSON files found</TableCell>
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
    </div>
  )
}
