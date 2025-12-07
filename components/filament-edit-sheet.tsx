/** @format */

"use client";

import { useState, useEffect } from "react";
import { FilamentProfile } from "@/types/filament";
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
import { Printer } from "@/types/printer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import {
  AudioWaveform,
  Box,
  Check,
  Circle,
  CircleCheckBig,
  Fan,
  Flame,
  Settings,
  Settings2,
  Spool,
  Thermometer,
  Waves,
  Wind,
  X,
} from "lucide-react";

interface FilamentEditSheetProps {
  profile: FilamentProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    updates: Partial<FilamentProfile>,
    silent?: boolean
  ) => Promise<void>;
  printers: Printer[];
}

export function FilamentEditSheet({
  profile,
  isOpen,
  onClose,
  onSave,
  printers,
}: FilamentEditSheetProps) {
  const [formData, setFormData] = useState<Partial<FilamentProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<Partial<FilamentProfile>>(
    {}
  );

  useEffect(() => {
    if (profile) {
      setFormData({ ...profile });
      setLastSavedData({ ...profile });
    }
  }, [profile]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        profile &&
        JSON.stringify(formData) !== JSON.stringify(lastSavedData)
      ) {
        setIsSaving(true);
        await onSave(profile.id, formData, true);
        setLastSavedData({ ...formData });
        setIsSaving(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [formData, profile, onSave, lastSavedData]);

  const handleChange = (field: keyof FilamentProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!profile) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="md:w-[65%] sm:w-[640px] sm:max-w-none h-full">
        <SheetHeader className="pb-0 px-6">
          <SheetTitle>Edit Filament Profile</SheetTitle>
          <SheetDescription>
            Make changes to your filament profile here.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="overflow-y-auto">
          <Tabs defaultValue="filament" className="px-6">
            <TabsList className="mb-1">
              <TabsTrigger value="filament">Filament</TabsTrigger>
              <TabsTrigger value="cooling">Cooling</TabsTrigger>
              <TabsTrigger value="override">Override Settings</TabsTrigger>
            </TabsList>
            <div className="pb-6">
              <TabsContent value="filament" className="space-y-6">
                {/* Basic Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 stroke-primary" />
                      Basic Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand || ""}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("brand", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex flex-row gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="type">Material Type</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) =>
                              handleChange("type", value)
                            }
                          >
                            <SelectTrigger id="type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLA">PLA</SelectItem>
                              <SelectItem value="PETG">PETG</SelectItem>
                              <SelectItem value="ABS">ABS</SelectItem>
                              <SelectItem value="ASA">ASA</SelectItem>
                              <SelectItem value="TPU">TPU</SelectItem>
                              <SelectItem value="PC">PC</SelectItem>
                              <SelectItem value="Nylon">Nylon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Label className="shrink" htmlFor="printer">
                            Compatible Printer
                          </Label>
                          <Select
                            value={formData.printerId || "none"}
                            onValueChange={(value) => {
                              const printerId =
                                value === "none" ? undefined : value;
                              const printer = printers.find(
                                (p) => p.id === value
                              );
                              handleChange("printerId", printerId);
                              handleChange(
                                "printerName",
                                printer ? printer.name : undefined
                              );
                            }}
                          >
                            <SelectTrigger id="printer">
                              <SelectValue placeholder="Select printer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">All Printers</SelectItem>
                              {printers.map((printer) => (
                                <SelectItem key={printer.id} value={printer.id}>
                                  {printer.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2">
                          <div className="relative w-10 h-10 shrink-0 overflow-hidden rounded-lg border border-input shadow-sm">
                            <input
                              type="color"
                              className="absolute inset-0 -m-[50%] h-[200%] w-[200%] cursor-pointer border-0 p-0"
                              value={formData.color || "#000000"}
                              onFocus={(event) => event.target.select()}
                              onChange={(e) =>
                                handleChange("color", e.target.value)
                              }
                            />
                          </div>
                          <Input
                            id="color"
                            value={formData.color || ""}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange("color", e.target.value)
                            }
                            placeholder="#000000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cost">Cost per kg</Label>
                        <Input
                          id="cost"
                          type="number"
                          value={formData.costPerKg || 0}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("costPerKg", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="diameter">Diameter</Label>
                        <Input
                          id="diameter"
                          type="number"
                          step="0.01"
                          value={formData.diameter || 1.75}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("diameter", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="density">Density</Label>
                        <Input
                          id="density"
                          type="number"
                          step="0.01"
                          value={formData.density || 1.24}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("density", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shrinkageXY">Shrinkage XY (%)</Label>
                        <Input
                          id="shrinkageXY"
                          type="number"
                          step="0.01"
                          max="110"
                          min="90"
                          value={formData.shrinkageXY || 100}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("shrinkageXY", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shrinkageZ">Shrinkage Z (%)</Label>
                        <Input
                          id="shrinkageZ"
                          type="number"
                          step="0.01"
                          max="110"
                          min="90"
                          value={formData.shrinkageZ || 100}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("shrinkageZ", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Flow & Pressure Advance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Waves className="w-5 stroke-primary" />
                      Flow & Pressure Advance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="flowRatio">Flow Ratio</Label>
                        <Input
                          id="flowRatio"
                          type="number"
                          step="0.01"
                          value={formData.flowRatio || 1}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("flowRatio", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="enablePressureAdvance">
                          Pressure Advance
                        </Label>
                        <div className="flex flex-row items-center space-x-1">
                          <Toggle
                            id="enablePressureAdvance"
                            variant="outline"
                            size="sm"
                            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary w-10 h-9"
                            pressed={formData.enablePressureAdvance}
                            onPressedChange={(pressed: boolean) =>
                              handleChange("enablePressureAdvance", pressed)
                            }
                          >
                            {formData.enablePressureAdvance ? (
                              <CircleCheckBig />
                            ) : (
                              <Circle />
                            )}
                          </Toggle>
                          <Input
                            id="pressureAdvance"
                            type="number"
                            step="0.001"
                            value={formData.pressureAdvance || 0}
                            disabled={!formData.enablePressureAdvance}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange(
                                "pressureAdvance",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Temperature Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flame className="w-5 stroke-primary" />
                      Temperature Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />
                    <CardTitle>Nozzle Temperature</CardTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nozzleTempInitial">
                          First Layer (°C)
                        </Label>
                        <Input
                          id="nozzleTempInitial"
                          type="number"
                          value={formData.initialNozzleTemp || 0}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange(
                              "initialNozzleTemp",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nozzleTemp">Other Layers (°C)</Label>
                        <Input
                          id="nozzleTemp"
                          type="number"
                          value={formData.nozzleTemp || 0}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("nozzleTemp", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <CardTitle>Bed Temperature</CardTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bedTempInitial">
                          Initial Layer Bed Temp (°C)
                        </Label>
                        <Input
                          id="bedTempInitial"
                          type="number"
                          value={formData.initialBedTemp || 0}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange(
                              "initialBedTemp",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bedTemp">Bed Temp (°C)</Label>
                        <Input
                          id="bedTemp"
                          type="number"
                          value={formData.bedTemp || 0}
                          onFocus={(event) => event.target.select()}
                          onChange={(e) =>
                            handleChange("bedTemp", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <CardTitle>Chamber Temperature</CardTitle>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chamberTempControl">
                          Chamber Temperature (°C)
                        </Label>
                        <div className="flex flex-row items-center space-x-1">
                          <Toggle
                            id="chamberTempControl"
                            variant="outline"
                            size="sm"
                            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary w-10 h-9"
                            pressed={formData.chamberTempControl}
                            onPressedChange={(pressed: boolean) =>
                              handleChange("chamberTempControl", pressed)
                            }
                          >
                            {formData.chamberTempControl ? (
                              <CircleCheckBig />
                            ) : (
                              <Circle />
                            )}
                          </Toggle>
                          <Input
                            id="chamberTemp"
                            type="number"
                            step="1"
                            value={formData.chamberTemp || 0}
                            disabled={!formData.chamberTempControl}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange(
                                "chamberTemp",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="cooling">
                {/* Cooling Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wind className="w-5 stroke-primary" />
                      Cooling Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fanSpeedMin">Min Fan Speed (%)</Label>
                        <Input
                          id="fanSpeedMin"
                          type="number"
                          value={formData.fanSpeedMin || 0}
                          onChange={(e) =>
                            handleChange("fanSpeedMin", Number(e.target.value))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fanSpeedMax">Max Fan Speed (%)</Label>
                        <Input
                          id="fanSpeedMax"
                          type="number"
                          value={formData.fanSpeedMax || 100}
                          onChange={(e) =>
                            handleChange("fanSpeedMax", Number(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minLayerTime">Min Layer Time (s)</Label>
                      <Input
                        id="minLayerTime"
                        type="number"
                        value={formData.minFanSpeedLayerTime || 0}
                        onChange={(e) =>
                          handleChange(
                            "minFanSpeedLayerTime",
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="override">
                {/* Override Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings2 className="w-5 stroke-primary" />
                      Override Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Separator />

                    <CardTitle>Retraction & Z-Hop</CardTitle>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="retractionLength">
                          Retraction Length (mm)
                        </Label>
                        <div className="flex flex-row items-center space-x-1">
                          <Toggle
                            id="retractionLength"
                            variant="outline"
                            size="sm"
                            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary w-10 h-9"
                            pressed={formData.enableRetraction}
                            onPressedChange={(pressed: boolean) =>
                              handleChange("enableRetraction", pressed)
                            }
                          >
                            {formData.enableRetraction ? (
                              <CircleCheckBig />
                            ) : (
                              <Circle />
                            )}
                          </Toggle>

                          <Input
                            id="retractionLength"
                            type="number"
                            step="0.1"
                            value={formData.retractionLength || 0}
                            disabled={!formData.enableRetraction}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange(
                                "retractionLength",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-row gap-4 col-span-2">
                        <div className="flex flex-col items-center">
                          <div className="space-y-2">
                            <Label htmlFor="zhopType">Z-Hop Type</Label>
                            <Select
                              value={formData.zhopType || "Normal Lift"}
                              onValueChange={(value) =>
                                handleChange("zhopType", value)
                              }
                            >
                              <SelectTrigger id="zhopType">
                                <SelectValue placeholder="Select Z-Hop Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="Auto Lift">
                                  Auto Lift
                                </SelectItem>
                                <SelectItem value="Normal Lift">
                                  Normal Lift
                                </SelectItem>
                                <SelectItem value="Slope Lift">
                                  Slope Lift
                                </SelectItem>
                                <SelectItem value="Spiral Lift">
                                  Spiral Lift
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grow col-span-2 space-y-2">
                          <Label htmlFor="zhopHeight">Z-Hop Height (mm)</Label>
                          <div className="flex flex-row items-center space-x-1">
                            <Input
                              id="zhopHeight"
                              type="number"
                              step="0.1"
                              value={formData.zhopHeight || 0}
                              disabled={formData.zhopType === "None"}
                              onFocus={(event) => event.target.select()}
                              onChange={(e) =>
                                handleChange(
                                  "zhopHeight",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="enableRetractionLiftAbove">
                          Lift Z Above (mm)
                        </Label>
                        <div className="flex flex-row items-center space-x-1">
                          <Toggle
                            id="enableRetractionLiftAbove"
                            variant="outline"
                            size="sm"
                            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary w-10 h-9"
                            pressed={formData.enableRetractionLiftAbove}
                            onPressedChange={(pressed: boolean) =>
                              handleChange("enableRetractionLiftAbove", pressed)
                            }
                          >
                            {formData.enableRetractionLiftAbove ? (
                              <CircleCheckBig />
                            ) : (
                              <Circle />
                            )}
                          </Toggle>

                          <Input
                            id="retractLiftAbove"
                            type="number"
                            step="0.1"
                            value={formData.retractLiftAbove || 0}
                            disabled={!formData.enableRetractionLiftAbove}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange(
                                "retractLiftAbove",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="enableRetractionLiftBelow">
                          Lift Z Below (mm)
                        </Label>
                        <div className="flex flex-row items-center space-x-1">
                          <Toggle
                            id="enableRetractionLiftBelow"
                            variant="outline"
                            size="sm"
                            className="data-[state=on]:bg-transparent data-[state=on]:*:[svg]:stroke-primary w-10 h-9"
                            pressed={formData.enableRetractionLiftBelow}
                            onPressedChange={(pressed: boolean) =>
                              handleChange("enableRetractionLiftBelow", pressed)
                            }
                          >
                            {formData.enableRetractionLiftBelow ? (
                              <CircleCheckBig />
                            ) : (
                              <Circle />
                            )}
                          </Toggle>

                          <Input
                            id="retractLiftBelow"
                            type="number"
                            step="0.1"
                            value={formData.retractLiftBelow || 0}
                            disabled={!formData.enableRetractionLiftBelow}
                            onFocus={(event) => event.target.select()}
                            onChange={(e) =>
                              handleChange(
                                "retractLiftBelow",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
