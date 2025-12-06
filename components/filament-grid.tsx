/** @format */

"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilamentProfile } from "@/types/profile";
import { Plus, ArrowUpDown, Trash2, Edit } from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Printer } from "@/types/printer";
import { FilamentEditSheet } from "@/components/filament-edit-sheet";
import { toast } from "sonner";

interface ProfileGridProps {
  data: FilamentProfile[];
  setData: React.Dispatch<React.SetStateAction<FilamentProfile[]>>;
}

export function ProfileGrid({ data, setData }: ProfileGridProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [printers, setPrinters] = React.useState<Printer[]>([]);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingProfile, setEditingProfile] =
    React.useState<FilamentProfile | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "filaments"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const profiles: FilamentProfile[] = [];
      querySnapshot.forEach((doc) => {
        profiles.push({ id: doc.id, ...doc.data() } as FilamentProfile);
      });
      setData(profiles);
      setIsLoading(false);
    });

    const qPrinters = query(collection(db, "users", user.uid, "printers"));
    const unsubscribePrinters = onSnapshot(qPrinters, (querySnapshot) => {
      const printersData: Printer[] = [];
      querySnapshot.forEach((doc) => {
        printersData.push({ id: doc.id, ...doc.data() } as Printer);
      });
      setPrinters(printersData);
    });

    return () => {
      unsubscribe();
      unsubscribePrinters();
    };
  }, [user, setData]);

  const handleSaveProfile = async (
    id: string,
    updates: Partial<FilamentProfile>,
    silent: boolean = false
  ) => {
    if (!user) return;
    console.log("Updating Firestore doc:", id, updates);
    try {
      const docRef = doc(db, "users", user.uid, "filaments", id);
      await updateDoc(docRef, updates);
      console.log("Firestore update complete");
      if (!silent) {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      if (!silent) {
        toast.error("Failed to update profile");
      }
    }
  };

  const deleteProfile = async (profile: FilamentProfile) => {
    if (!user) return;

    setDeletingId(profile.id);

    try {
      await deleteDoc(doc(db, "users", user.uid, "filaments", profile.id));
    } catch (error) {
      console.error("Failed to delete profile:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (profile: FilamentProfile) => {
    setEditingProfile(profile);
    setIsEditSheetOpen(true);
  };

  const columns: ColumnDef<FilamentProfile>[] = [
    {
      accessorKey: "brand",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="cursor-pointer"
          >
            Brand
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="pl-4">{row.getValue("brand")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div>{row.getValue("type")}</div>,
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => {
        const color = row.getValue("color") as string;
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-6 rounded-full border border-white/25"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{color}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "printerName",
      header: "Printer",
      cell: ({ row }) => {
        const printerName = row.original.printerName;
        return <div>{printerName || "All Printers"}</div>;
      },
    },
    {
      accessorKey: "costPerKg",
      header: "Cost / kg",
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("costPerKg"));
        return <div>{isNaN(cost) ? "-" : cost.toFixed(2)}</div>;
      },
    },
    {
      id: "edit",
      header: "Edit",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(profile)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
    {
      id: "delete",
      header: "Delete",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the filament profile.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteProfile(profile)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deletingId === profile.id ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const addRow = async () => {
    if (!user) return;

    const newProfile = {
      brand: "New Brand",
      color: "#FFFFFF",
      type: "PLA",
      costPerKg: "0",
      flowRatio: "1.0",
      initialNozzleTemp: "210",
      nozzleTemp: "210",
      initialBedTemp: "60",
      bedTemp: "60",
      retractionLength: "0.5",
      zhopHeight: "0.2",
      zhopType: "Normal Lift",
      // Required properties with defaults
      isSupportMaterial: false,
      diameter: "1.75",
      density: "1.24",
      shrinkageXY: "0",
      shrinkageZ: "0",
      nozzleTempRangeLow: "190",
      nozzleTempRangeHigh: "230",
      enablePressureAdvance: false,
      pressureAdvance: "0",
      chamberTemp: "0",
      chamberTempControl: false,
      fanSpeedMin: "35",
      fanSpeedMax: "100",
      minFanSpeedLayerTime: "10",
      retractLiftAbove: "0",
      retractLiftBelow: "0",
    };

    const docRef = await addDoc(
      collection(db, "users", user.uid, "filaments"),
      newProfile
    );

    // Open edit sheet for the new profile immediately
    const addedProfile = {
      id: docRef.id,
      ...newProfile,
    } as FilamentProfile;
    handleEditClick(addedProfile);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder="Filter brands..."
          value={(table.getColumn("brand")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("brand")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={addRow} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" /> Add Filament
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
                  );
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FilamentEditSheet
        profile={editingProfile}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        onSave={handleSaveProfile}
        printers={printers}
      />
    </div>
  );
}
