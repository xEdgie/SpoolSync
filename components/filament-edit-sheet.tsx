/** @format */

"use client";

import { useState, useEffect } from "react";
import { FilamentProfile } from "@/types/profile";
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
	const [lastSavedData, setLastSavedData] = useState<
		Partial<FilamentProfile>
	>({});

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
				<SheetHeader className="pb-0">
					<SheetTitle>Edit Filament Profile</SheetTitle>
					<SheetDescription>
						Make changes to your filament profile here.
					</SheetDescription>
				</SheetHeader>

				<ScrollArea className="px-6 overflow-y-auto">
					<div className="space-y-6 pb-6">
						{/* Basic Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Basic Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="brand">Brand</Label>
										<Input
											id="brand"
											value={formData.brand || ""}
											onChange={(e) =>
												handleChange(
													"brand",
													e.target.value
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="type">
											Material Type
										</Label>
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
												<SelectItem value="PLA">
													PLA
												</SelectItem>
												<SelectItem value="PETG">
													PETG
												</SelectItem>
												<SelectItem value="ABS">
													ABS
												</SelectItem>
												<SelectItem value="ASA">
													ASA
												</SelectItem>
												<SelectItem value="TPU">
													TPU
												</SelectItem>
												<SelectItem value="PC">
													PC
												</SelectItem>
												<SelectItem value="Nylon">
													Nylon
												</SelectItem>
											</SelectContent>
										</Select>
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
													value={
														formData.color ||
														"#000000"
													}
													onChange={(e) =>
														handleChange(
															"color",
															e.target.value
														)
													}
												/>
											</div>
											<Input
												id="color"
												value={formData.color || ""}
												onChange={(e) =>
													handleChange(
														"color",
														e.target.value
													)
												}
												placeholder="#000000"
											/>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="cost">
											Cost per kg
										</Label>
										<Input
											id="cost"
											type="number"
											value={formData.costPerKg || 0}
											onChange={(e) =>
												handleChange(
													"costPerKg",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="printer">
										Compatible Printer
									</Label>
									<Select
										value={formData.printerId || "none"}
										onValueChange={(value) => {
											const printerId =
												value === "none"
													? undefined
													: value;
											const printer = printers.find(
												(p) => p.id === value
											);
											handleChange(
												"printerId",
												printerId
											);
											handleChange(
												"printerName",
												printer
													? printer.name
													: undefined
											);
										}}
									>
										<SelectTrigger id="printer">
											<SelectValue placeholder="Select printer" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">
												All Printers
											</SelectItem>
											{printers.map((printer) => (
												<SelectItem
													key={printer.id}
													value={printer.id}
												>
													{printer.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</CardContent>
						</Card>

						{/* Temperature Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Temperature Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="nozzleTempInitial">
											Initial Layer Nozzle Temp (°C)
										</Label>
										<Input
											id="nozzleTempInitial"
											type="number"
											value={
												formData.initialNozzleTemp || 0
											}
											onChange={(e) =>
												handleChange(
													"initialNozzleTemp",
													Number(e.target.value)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="nozzleTemp">
											Nozzle Temp (°C)
										</Label>
										<Input
											id="nozzleTemp"
											type="number"
											value={formData.nozzleTemp || 0}
											onChange={(e) =>
												handleChange(
													"nozzleTemp",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="bedTempInitial">
											Initial Layer Bed Temp (°C)
										</Label>
										<Input
											id="bedTempInitial"
											type="number"
											value={formData.initialBedTemp || 0}
											onChange={(e) =>
												handleChange(
													"initialBedTemp",
													Number(e.target.value)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="bedTemp">
											Bed Temp (°C)
										</Label>
										<Input
											id="bedTemp"
											type="number"
											value={formData.bedTemp || 0}
											onChange={(e) =>
												handleChange(
													"bedTemp",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Flow & Pressure Advance */}
						<Card>
							<CardHeader>
								<CardTitle>Flow & Pressure Advance</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="flowRatio">
											Flow Ratio
										</Label>
										<Input
											id="flowRatio"
											type="number"
											step="0.01"
											value={formData.flowRatio || 1}
											onChange={(e) =>
												handleChange(
													"flowRatio",
													Number(e.target.value)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="pressureAdvance">
											Pressure Advance
										</Label>
										<Input
											id="pressureAdvance"
											type="number"
											step="0.001"
											value={
												formData.pressureAdvance || 0
											}
											onChange={(e) =>
												handleChange(
													"pressureAdvance",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Cooling Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Cooling Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="fanSpeedMin">
											Min Fan Speed (%)
										</Label>
										<Input
											id="fanSpeedMin"
											type="number"
											value={formData.fanSpeedMin || 0}
											onChange={(e) =>
												handleChange(
													"fanSpeedMin",
													Number(e.target.value)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="fanSpeedMax">
											Max Fan Speed (%)
										</Label>
										<Input
											id="fanSpeedMax"
											type="number"
											value={formData.fanSpeedMax || 100}
											onChange={(e) =>
												handleChange(
													"fanSpeedMax",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="minLayerTime">
										Min Layer Time (s)
									</Label>
									<Input
										id="minLayerTime"
										type="number"
										value={
											formData.minFanSpeedLayerTime || 0
										}
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

						{/* Retraction Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Retraction Settings</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="retractionLength">
											Retraction Length (mm)
										</Label>
										<Input
											id="retractionLength"
											type="number"
											step="0.1"
											value={
												formData.retractionLength || 0
											}
											onChange={(e) =>
												handleChange(
													"retractionLength",
													Number(e.target.value)
												)
											}
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="zhopHeight">
											Z-Hop Height (mm)
										</Label>
										<Input
											id="zhopHeight"
											type="number"
											step="0.1"
											value={formData.zhopHeight || 0}
											onChange={(e) =>
												handleChange(
													"zhopHeight",
													Number(e.target.value)
												)
											}
										/>
									</div>
								</div>
								<div className="space-y-2">
									<Label htmlFor="zhopType">Z-Hop Type</Label>
									<Select
										value={
											formData.zhopType || "Normal Lift"
										}
										onValueChange={(value) =>
											handleChange("zhopType", value)
										}
									>
										<SelectTrigger id="zhopType">
											<SelectValue placeholder="Select Z-Hop Type" />
										</SelectTrigger>
										<SelectContent>
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
							</CardContent>
						</Card>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
