"use client";

import { useState, useEffect } from "react";
import { Printer } from "@/types/printer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Textarea } from "@/components/ui/textarea";
import {
  Printer as PrinterIcon,
  Settings,
  Move,
  Zap,
  FileCode,
  CircleCheckBig,
  Circle,
} from "lucide-react";

interface PrinterEditSheetProps {
  printer: Printer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: Partial<Printer>,
    silent?: boolean
  ) => Promise<void>;
}

export function PrinterEditSheet({
  printer,
  isOpen,
  onClose,
  onSave,
}: PrinterEditSheetProps) {
  const [formData, setFormData] = useState<Partial<Printer>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<Partial<Printer>>({});

  useEffect(() => {
    if (printer) {
      setFormData({ ...printer });
      setLastSavedData({ ...printer });
    }
  }, [printer]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        printer &&
        JSON.stringify(formData) !== JSON.stringify(lastSavedData)
      ) {
        setIsSaving(true);
        await onSave(printer.id, formData, true);
        setLastSavedData({ ...formData });
        setIsSaving(false);
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(timer);
  }, [formData, printer, onSave, lastSavedData]);

  const handleChange = (field: keyof Printer, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!printer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="md:w-[65%] sm:w-[640px] sm:max-w-none h-full flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Edit Printer Profile</SheetTitle>
          <SheetDescription>
            Configure your printer's hardware limits and extruder settings.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="mb-4 w-full justify-start">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="machine">Machine</TabsTrigger>
                <TabsTrigger value="extruder">Extruder</TabsTrigger>
                <TabsTrigger value="motion">Motion</TabsTrigger>
                <TabsTrigger value="gcode">G-code</TabsTrigger>
              </TabsList>

              {/* General Settings */}
              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      General Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Profile Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("name", e.target.value)
                          }
                          placeholder="My Printer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={formData.model || ""}
                          onChange={(e) =>
                            handleChange("model", e.target.value)
                          }
                          placeholder="Voron 2.4, Ender 3, etc."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gcodeFlavor">G-code Flavor</Label>
                      <Select
                        value={formData.gcodeFlavor || "marlin"}
                        onValueChange={(value) =>
                          handleChange("gcodeFlavor", value)
                        }
                      >
                        <SelectTrigger id="gcodeFlavor">
                          <SelectValue placeholder="Select flavor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="marlin">
                            Marlin (Legacy)
                          </SelectItem>
                          <SelectItem value="klipper">Klipper</SelectItem>
                          <SelectItem value="reprap">RepRap</SelectItem>
                          <SelectItem value="bambu">Bambu Lab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Machine Limits */}
              <TabsContent value="machine" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PrinterIcon className="w-5 h-5 text-primary" />
                      Physical Dimensions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedSizeX">Bed Size X (mm)</Label>
                        <Input
                          id="bedSizeX"
                          type="number"
                          value={formData.bedSizeX || 0}
                          onChange={(e) =>
                            handleChange("bedSizeX", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bedSizeY">Bed Size Y (mm)</Label>
                        <Input
                          id="bedSizeY"
                          type="number"
                          value={formData.bedSizeY || 0}
                          onChange={(e) =>
                            handleChange("bedSizeY", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxPrintHeight">
                          Print Height (mm)
                        </Label>
                        <Input
                          id="maxPrintHeight"
                          type="number"
                          value={formData.maxPrintHeight || 0}
                          onChange={(e) =>
                            handleChange(
                              "maxPrintHeight",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nozzleDiameter">
                          Nozzle Diameter (mm)
                        </Label>
                        <Input
                          id="nozzleDiameter"
                          type="number"
                          step="0.1"
                          value={formData.nozzleDiameter || 0.4}
                          onChange={(e) =>
                            handleChange(
                              "nozzleDiameter",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auxiliaryFan">Auxiliary Fan</Label>
                      <Toggle
                        id="auxiliaryFan"
                        variant="outline"
                        size="sm"
                        pressed={formData.auxiliaryFan}
                        onPressedChange={(pressed) =>
                          handleChange("auxiliaryFan", pressed)
                        }
                      >
                        {formData.auxiliaryFan ? (
                          <CircleCheckBig className="w-4 h-4 text-primary" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Toggle>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Extruder Settings */}
              <TabsContent value="extruder" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-primary" />
                      Retraction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="retractionType">Retraction Type</Label>
                      <Select
                        value={formData.retractionType || "software"}
                        onValueChange={(value) =>
                          handleChange("retractionType", value)
                        }
                      >
                        <SelectTrigger id="retractionType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="software">
                            Software (Slicer)
                          </SelectItem>
                          <SelectItem value="firmware">
                            Firmware (G10/G11)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="retractionLength">Length (mm)</Label>
                        <Input
                          id="retractionLength"
                          type="number"
                          step="0.1"
                          value={formData.retractionLength || 0}
                          onChange={(e) =>
                            handleChange(
                              "retractionLength",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="retractionSpeed">
                          Retraction Speed (mm/s)
                        </Label>
                        <Input
                          id="retractionSpeed"
                          type="number"
                          value={formData.retractionSpeed || 40}
                          onChange={(e) =>
                            handleChange(
                              "retractionSpeed",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deretractionSpeed">
                          Deretraction Speed (mm/s)
                        </Label>
                        <Input
                          id="deretractionSpeed"
                          type="number"
                          value={formData.deretractionSpeed || 40}
                          onChange={(e) =>
                            handleChange(
                              "deretractionSpeed",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Motion Limits */}
              <TabsContent value="motion" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Move className="w-5 h-5 text-primary" />
                      Speed Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxPrintSpeed">
                          Max Print Speed (mm/s)
                        </Label>
                        <Input
                          id="maxPrintSpeed"
                          type="number"
                          value={formData.maxPrintSpeed || 300}
                          onChange={(e) =>
                            handleChange(
                              "maxPrintSpeed",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxTravelSpeed">
                          Max Travel Speed (mm/s)
                        </Label>
                        <Input
                          id="maxTravelSpeed"
                          type="number"
                          value={formData.maxTravelSpeed || 500}
                          onChange={(e) =>
                            handleChange(
                              "maxTravelSpeed",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Acceleration Limits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxAccelX">Max Accel X (mm/s²)</Label>
                        <Input
                          id="maxAccelX"
                          type="number"
                          value={formData.maxAccelerationX || 5000}
                          onChange={(e) =>
                            handleChange(
                              "maxAccelerationX",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAccelY">Max Accel Y (mm/s²)</Label>
                        <Input
                          id="maxAccelY"
                          type="number"
                          value={formData.maxAccelerationY || 5000}
                          onChange={(e) =>
                            handleChange(
                              "maxAccelerationY",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAccelZ">Max Accel Z (mm/s²)</Label>
                        <Input
                          id="maxAccelZ"
                          type="number"
                          value={formData.maxAccelerationZ || 500}
                          onChange={(e) =>
                            handleChange(
                              "maxAccelerationZ",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAccelE">Max Accel E (mm/s²)</Label>
                        <Input
                          id="maxAccelE"
                          type="number"
                          value={formData.maxAccelerationE || 5000}
                          onChange={(e) =>
                            handleChange(
                              "maxAccelerationE",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Custom G-code */}
              <TabsContent value="gcode" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-primary" />
                      Custom G-code
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="startGcode">Start G-code</Label>
                      <Textarea
                        id="startGcode"
                        className="font-mono text-xs h-32"
                        value={formData.startGcode || ""}
                        onChange={(e) =>
                          handleChange("startGcode", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endGcode">End G-code</Label>
                      <Textarea
                        id="endGcode"
                        className="font-mono text-xs h-32"
                        value={formData.endGcode || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          handleChange("endGcode", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
