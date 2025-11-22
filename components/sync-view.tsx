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
import { RefreshCw, FileJson, CheckCircle2, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export function SyncView() {
  const [profiles, setProfiles] = useState<FilamentProfile[]>([])
  const [localFiles, setLocalFiles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<{ success: boolean; message: string } | null>(null)
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

    return () => unsubscribe()
  }, [user])

  const handleSync = async () => {
    if (!window.electron || profiles.length === 0) return
    
    setIsSyncing(true)
    setSyncStatus(null)

    try {
      const homeDir = await window.electron.getHomeDir()
      const baseDir = localStorage.getItem("orcaSlicerPath") || `${homeDir}/Library/Application Support/OrcaSlicer`
      let targetDir = await window.electron.joinPath(baseDir, "user", "default", "filament")
      const exists = await window.electron.checkDirExists(targetDir)
      
      if (!exists) {
          // Try creating? Or fallback.
          // If we can't find the exact folder, maybe we shouldn't write blindly.
          // But for this "test" phase, let's write to the configured path if the deep one fails.
          targetDir = baseDir
      }

      let successCount = 0
      
      for (const profile of profiles) {
        const jsonContent = generateFilamentJson(profile)
        // Safety: Prefix with test_
        const fileName = `test_${profile.brand}_${profile.type}.json`.replace(/\s+/g, '_')
        const filePath = await window.electron.joinPath(targetDir, fileName)
        
        const written = await window.electron.writeFile(filePath, jsonContent)
        if (written) successCount++
      }

      setSyncStatus({
        success: true,
        message: `Successfully synced ${successCount} profiles to ${targetDir}`
      })
      
      await fetchLocalFiles() // Refresh list
    } catch (error) {
      console.error("Sync failed:", error)
      setSyncStatus({
        success: false,
        message: "Failed to sync profiles. Check console for details."
      })
    } finally {
      setIsSyncing(false)
    }
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
        </div>
        <Button onClick={handleSync} disabled={isSyncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Test Files'}
        </Button>
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
                <CardDescription>{profiles.length} profiles ready to sync</CardDescription>
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
                <CardTitle>Local Files (Test)</CardTitle>
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
