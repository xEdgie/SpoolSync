"use client"

import { useState, useEffect } from "react"
import { Printer } from "@/types/printer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"

import { Skeleton } from "@/components/ui/skeleton"

// ... existing imports

export function PrintersTable() {
  const [printers, setPrinters] = useState<Printer[]>([])
  const [newPrinterName, setNewPrinterName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "printers"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const printersData: Printer[] = []
      querySnapshot.forEach((doc) => {
        printersData.push({ id: doc.id, ...doc.data() } as Printer)
      })
      setPrinters(printersData)
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const addPrinter = async () => {
    if (!newPrinterName.trim() || !user) return
    
    const newPrinter = {
      name: newPrinterName
    }
    
    await addDoc(collection(db, "users", user.uid, "printers"), newPrinter)
    setNewPrinterName("")
  }

  const deletePrinter = async (id: string) => {
    if (!user) return
    await deleteDoc(doc(db, "users", user.uid, "printers", id))
  }

  const updatePrinter = async (id: string, newName: string) => {
    if (!user) return
    await updateDoc(doc(db, "users", user.uid, "printers", id), { name: newName })
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-4 max-w-md">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="rounded-md border max-w-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-6 w-24" /></TableHead>
                <TableHead className="w-[100px] text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* ... existing render */}
      <div className="flex items-center gap-4 max-w-md">
        <Input 
          placeholder="Printer Name (e.g. Bambu Lab X1C)" 
          value={newPrinterName}
          onChange={(e) => setNewPrinterName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addPrinter()
          }}
        />
        <Button onClick={addPrinter}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="rounded-md border max-w-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                  No printers added yet.
                </TableCell>
              </TableRow>
            ) : (
              printers.map((printer) => (
                <TableRow key={printer.id}>
                  <TableCell className="font-medium">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-auto p-0 font-normal hover:bg-transparent hover:underline justify-start">
                          {printer.name}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium leading-none">Edit Printer</h4>
                            <p className="text-sm text-muted-foreground">
                              Update the name of your printer.
                            </p>
                          </div>
                          <Input
                            defaultValue={printer.name}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updatePrinter(printer.id, (e.target as HTMLInputElement).value)
                                // Close popover logic would require controlled state or ref, 
                                // for now simple update is fine, user clicks away.
                              }
                            }}
                            onBlur={(e) => updatePrinter(printer.id, e.target.value)}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deletePrinter(printer.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
