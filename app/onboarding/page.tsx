"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FolderOpen } from "lucide-react"

export default function OnboardingPage() {
  const [path, setPath] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const detectPath = async () => {
      if (typeof window !== 'undefined' && window.electron) {
        try {
          const homeDir = await window.electron.getHomeDir()
          const defaultPath = `${homeDir}/Library/Application Support/OrcaSlicer`
          const exists = await window.electron.checkDirExists(defaultPath)
          
          if (exists) {
            setPath(defaultPath)
          }
        } catch (error) {
          console.error("Failed to detect path:", error)
        }
      }
      setIsLoading(false)
    }

    detectPath()
  }, [])

  const handleBrowse = async () => {
    if (window.electron) {
      const selectedPath = await window.electron.selectDirectory()
      if (selectedPath) {
        setPath(selectedPath)
      }
    }
  }

  const handleContinue = () => {
    if (path) {
      localStorage.setItem("orcaSlicerPath", path)
      router.push("/dashboard")
    }
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/50">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Welcome to SpoolSync</CardTitle>
          <CardDescription>
            Let's set up your OrcaSlicer directory to sync your profiles.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="path">OrcaSlicer User Directory</Label>
            <div className="flex gap-2">
              <Input 
                id="path" 
                value={path} 
                onChange={(e) => setPath(e.target.value)}
                placeholder="Select your OrcaSlicer folder..."
              />
              <Button variant="outline" size="icon" onClick={handleBrowse}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Usually located at ~/Library/Application Support/OrcaSlicer
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleContinue} disabled={!path}>
            Continue to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
