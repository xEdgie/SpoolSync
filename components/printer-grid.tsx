"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Printer } from "@/types/printer";
import {
  Plus,
  Trash2,
  Edit,
  Printer as PrinterIcon,
  Settings,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
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
import { toast } from "sonner";
import { PrinterEditSheet } from "@/components/printer-edit-sheet";

export function PrinterGrid() {
  const [printers, setPrinters] = React.useState<Printer[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingPrinter, setEditingPrinter] = React.useState<Printer | null>(
    null
  );
  const [isEditSheetOpen, setIsEditSheetOpen] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const { user } = useAuth();

  React.useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "users", user.uid, "printers"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const printersData: Printer[] = [];
      querySnapshot.forEach((doc) => {
        printersData.push({ id: doc.id, ...doc.data() } as Printer);
      });
      setPrinters(printersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSavePrinter = async (
    id: string,
    updates: Partial<Printer>,
    silent: boolean = false
  ) => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid, "printers", id);
      await updateDoc(docRef, updates);
      if (!silent) {
        toast.success("Printer updated successfully");
      }
    } catch (error) {
      console.error("Error updating printer:", error);
      if (!silent) {
        toast.error("Failed to update printer");
      }
    }
  };

  const addPrinter = async () => {
    if (!user) return;

    const newPrinter: Omit<Printer, "id"> = {
      name: "New Printer",
      model: "Generic Klipper Printer",
      nozzleDiameter: 0.4,
      bedSizeX: 250,
      bedSizeY: 250,
      maxPrintHeight: 250,
      retractionLength: 0.8,
      retractionSpeed: 40,
      deretractionSpeed: 40,
      retractionType: "software",
      maxPrintSpeed: 300,
      maxTravelSpeed: 500,
      maxAccelerationX: 5000,
      maxAccelerationY: 5000,
      maxAccelerationZ: 500,
      maxAccelerationE: 5000,
      gcodeFlavor: "klipper",
      startGcode: "; Start G-code",
      endGcode: "; End G-code",
      auxiliaryFan: false,
    };

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "printers"),
        newPrinter
      );
      const addedPrinter = { id: docRef.id, ...newPrinter } as Printer;
      handleEditClick(addedPrinter);
      toast.success("New printer added");
    } catch (error) {
      console.error("Error adding printer:", error);
      toast.error("Failed to add printer");
    }
  };

  const deletePrinter = async (printer: Printer) => {
    if (!user) return;
    setDeletingId(printer.id);
    try {
      await deleteDoc(doc(db, "users", user.uid, "printers", printer.id));
      toast.success("Printer deleted");
    } catch (error) {
      console.error("Failed to delete printer:", error);
      toast.error("Failed to delete printer");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (printer: Printer) => {
    setEditingPrinter(printer);
    setIsEditSheetOpen(true);
  };

  const columns: ColumnDef<Printer>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          <PrinterIcon className="w-4 h-4 text-muted-foreground" />
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "model",
      header: "Model",
      cell: ({ row }) => row.getValue("model") || "-",
    },
    {
      accessorKey: "bedSize",
      header: "Build Volume (mm)",
      cell: ({ row }) => {
        const x = row.original.bedSizeX || 0;
        const y = row.original.bedSizeY || 0;
        const z = row.original.maxPrintHeight || 0;
        return (
          <span className="text-muted-foreground font-mono text-xs">
            {x} x {y} x {z}
          </span>
        );
      },
    },
    {
      accessorKey: "nozzleDiameter",
      header: "Nozzle",
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.nozzleDiameter}mm
        </span>
      ),
    },
    {
      accessorKey: "gcodeFlavor",
      header: "Flavor",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">
          {row.original.gcodeFlavor}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const printer = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(printer)}
              className="cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
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
                    the printer profile{" "}
                    <span className="font-semibold text-foreground">
                      {printer.name}
                    </span>
                    .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePrinter(printer)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deletingId === printer.id ? "Deleting..." : "Delete"}
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
    data: printers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Manage your printer profiles and hardware settings.
        </div>
        <Button onClick={addPrinter}>
          <Plus className="mr-2 h-4 w-4" /> Add Printer
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
                  No printers found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PrinterEditSheet
        printer={editingPrinter}
        isOpen={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
        onSave={handleSavePrinter}
      />
    </div>
  );
}
