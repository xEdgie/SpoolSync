"use client"

import { useState, useEffect } from "react"
import { FilamentProfile } from "@/types/profile"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { generateFilamentJson } from "@/lib/orcaslicer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function JsonDebugPage() {
  const [profiles, setProfiles] = useState<FilamentProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<FilamentProfile | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "filaments"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profilesData: FilamentProfile[] = []
      querySnapshot.forEach((doc) => {
        profilesData.push({ id: doc.id, ...doc.data() } as FilamentProfile)
      })
      setProfiles(profilesData)
      if (profilesData.length > 0 && !selectedProfile) {
        setSelectedProfile(profilesData[0])
      }
    })

    return () => unsubscribe()
  }, [user])

  return (
    <div className="container mx-auto p-4 flex gap-4 h-[calc(100vh-2rem)]">
      <Card className="w-1/3 flex flex-col">
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="flex flex-col p-4 gap-2">
              {profiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedProfile?.id === profile.id ? "default" : "ghost"}
                  className="justify-start"
                  onClick={() => setSelectedProfile(profile)}
                >
                  {profile.brand} - {profile.type}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Generated JSON</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 bg-muted/50 p-4 m-4 rounded-md font-mono text-sm overflow-auto">
          {selectedProfile ? (
            <pre>{generateFilamentJson(selectedProfile)}</pre>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a profile to view JSON
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
