"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FilamentProfile } from "@/types/profile"
import { Plus, ArrowUpDown } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, updateDoc, doc, onSnapshot, query } from "firebase/firestore"
import { useAuth } from "@/components/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Printer } from "@/types/printer"

interface ProfileGridProps {
  data: FilamentProfile[]
  setData: React.Dispatch<React.SetStateAction<FilamentProfile[]>>
}

export function ProfileGrid({ data, setData }: ProfileGridProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [printers, setPrinters] = React.useState<Printer[]>([])
  const { user } = useAuth()

  React.useEffect(() => {
    if (!user) return

    const q = query(collection(db, "users", user.uid, "filaments"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profiles: FilamentProfile[] = []
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() } as FilamentProfile)
      })
      setData(profiles)
      setIsLoading(false)
    })

    const qPrinters = query(collection(db, "users", user.uid, "printers"))
    const unsubscribePrinters = onSnapshot(qPrinters, (querySnapshot) => {
      const printersData: Printer[] = []
      querySnapshot.forEach((doc) => {
        printersData.push({ id: doc.id, ...doc.data() } as Printer)
      })
      setPrinters(printersData)
    })

    return () => {
      unsubscribe()
      unsubscribePrinters()
    }
  }, [user, setData])

  const updateProfile = async (id: string, field: string, value: any) => {
      if (!user) return
      const docRef = doc(db, "users", user.uid, "filaments", id)
      await updateDoc(docRef, { [field]: value })
  }

  const columns: ColumnDef<FilamentProfile>[] = [
    {
      accessorKey: "printerId",
      header: "Printer",
      cell: ({ row, getValue }) => {
        const value = getValue() as string
        
        return (
          <Select
            value={value || "none"}
            onValueChange={(newValue) => updateProfile(row.original.id, "printerId", newValue === "none" ? null : newValue)}
          >
            <SelectTrigger className="w-[140px] h-8 border-none bg-transparent focus:ring-0">
              <SelectValue placeholder="Select printer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {printers.map((printer) => (
                <SelectItem key={printer.id} value={printer.id}>
                  {printer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Brand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row, getValue, column: { id } }) => {
        const initialValue = getValue()
        const [value, setValue] = React.useState(initialValue)

        const onBlur = () => {
          updateProfile(row.original.id, id, value)
        }

        React.useEffect(() => {
          setValue(initialValue)
        }, [initialValue])

        return (
          <Input
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="h-8 w-full border-none bg-transparent p-0 focus-visible:ring-0"
          />
        )
      },
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row, getValue, column: { id } }) => {
        const initialValue = getValue()
        const [value, setValue] = React.useState(initialValue)

        const onBlur = () => {
          updateProfile(row.original.id, id, value)
        }

        React.useEffect(() => {
          setValue(initialValue)
        }, [initialValue])

        return (
           <div className="flex items-center gap-2">
            <div 
                className="h-4 w-6 rounded-full border border-white/25" 
                style={{ backgroundColor: value as string }}
            />
            <Input
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                className="h-8 w-full border-none bg-transparent p-0 focus-visible:ring-0"
            />
           </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row, getValue, column: { id } }) => {
        const initialValue = getValue()
        const [value, setValue] = React.useState(initialValue)

        const onBlur = () => {
          updateProfile(row.original.id, id, value)
        }

        React.useEffect(() => {
          setValue(initialValue)
        }, [initialValue])

        return (
          <Input
            value={value as string}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="h-8 w-full border-none bg-transparent p-0 focus-visible:ring-0"
          />
        )
      },
    },
    {
      accessorKey: "costPerKg",
      header: "Cost / kg",
      cell: ({ row, getValue, column: { id } }) => {
        const initialValue = getValue()
        const [value, setValue] = React.useState(initialValue)

        const onBlur = () => {
          updateProfile(row.original.id, id, Number(value))
        }

        React.useEffect(() => {
          setValue(initialValue)
        }, [initialValue])

        return (
          <Input
            type="number"
            value={value as number}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="h-8 w-full border-none bg-transparent p-0 focus-visible:ring-0"
          />
        )
      },
    },
    {
      accessorKey: "flowRatio",
      header: "Flow Ratio",
      cell: ({ row, getValue, column: { id } }) => {
        const initialValue = getValue()
        const [value, setValue] = React.useState(initialValue)

        const onBlur = () => {
          updateProfile(row.original.id, id, Number(value))
        }

        React.useEffect(() => {
          setValue(initialValue)
        }, [initialValue])

        return (
          <Input
            type="number"
            step="0.01"
            value={value as number}
            onChange={(e) => setValue(e.target.value)}
            onBlur={onBlur}
            className="h-8 w-full border-none bg-transparent p-0 focus-visible:ring-0"
          />
        )
      },
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const addRow = async () => {
      if (!user) return
      
      const newProfile = {
          brand: "New Brand",
          color: "#000000",
          type: "PLA",
          costPerKg: 0,
          flowRatio: 1.0
      }
      
      await addDoc(collection(db, "users", user.uid, "filaments"), newProfile)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[384px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((col, i) => (
                  <TableHead key={i}><Skeleton className="h-6 w-24" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col, j) => (
                    <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
            <Input
            placeholder="Filter brands..."
            value={(table.getColumn("brand")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
                table.getColumn("brand")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
            />
            <Select
                value={(table.getColumn("printerId")?.getFilterValue() as string) ?? "all"}
                onValueChange={(value) => 
                    table.getColumn("printerId")?.setFilterValue(value === "all" ? "" : value)
                }
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Printer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Printers</SelectItem>
                    {printers.map((printer) => (
                        <SelectItem key={printer.id} value={printer.id}>
                            {printer.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <Button onClick={addRow}>
            <Plus className="mr-2 h-4 w-4" /> Add Profile
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No Filaments Found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
