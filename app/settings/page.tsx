/** @format */

"use client";

import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FolderOpen, Save, RotateCcw, Cog, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
	const [orcaSlicerPath, setOrcaSlicerPath] = useState("");
	const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
	const [lastSyncTime, setLastSyncTime] = useState("");

	useEffect(() => {
		// Load settings from localStorage
		const savedPath = localStorage.getItem("orcaSlicerPath") || "";
		const savedAutoSync =
			localStorage.getItem("autoSyncEnabled") === "true";
		const savedLastSync = localStorage.getItem("lastSyncTime") || "";

		setOrcaSlicerPath(savedPath);
		setAutoSyncEnabled(savedAutoSync);
		setLastSyncTime(savedLastSync);
	}, []);

	const handleBrowseDirectory = async () => {
		if (!window.electron) {
			toast.error("This feature is only available in the Electron app");
			return;
		}

		const selectedPath = await window.electron.selectDirectory();
		if (selectedPath) {
			setOrcaSlicerPath(selectedPath);
		}
	};

	const handleSaveSettings = () => {
		localStorage.setItem("orcaSlicerPath", orcaSlicerPath);
		localStorage.setItem("autoSyncEnabled", autoSyncEnabled.toString());

		toast.success("Settings saved successfully");
	};

	const handleResetSettings = () => {
		const defaultPath = "";
		setOrcaSlicerPath(defaultPath);
		setAutoSyncEnabled(false);

		localStorage.removeItem("orcaSlicerPath");
		localStorage.removeItem("autoSyncEnabled");
		localStorage.removeItem("lastSyncTime");

		toast.success("Settings reset to defaults");
	};

	const formatLastSyncTime = (isoString: string) => {
		if (!isoString) return "Never";
		const date = new Date(isoString);
		return date.toLocaleString();
	};

	return (
		<div className="flex-1 space-y-4 p-8 pt-6">
			<div className="flex items-center gap-2">
				<Link href="/dashboard">
					<ArrowLeft />
				</Link>
				<h2 className="text-3xl font-bold tracking-tight">Settings</h2>
			</div>

			<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
				{/* OrcaSlicer Configuration */}
				<Card>
					<CardHeader>
						<CardTitle>OrcaSlicer Configuration</CardTitle>
						<CardDescription>
							Configure the path to your OrcaSlicer directory
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="orcaSlicerPath">
								OrcaSlicer Directory
							</Label>
							<div className="flex gap-2">
								<Input
									id="orcaSlicerPath"
									value={orcaSlicerPath}
									onChange={(e) =>
										setOrcaSlicerPath(e.target.value)
									}
									placeholder="C:\Users\YourName\AppData\Roaming\OrcaSlicer"
									className="flex-1"
								/>
								<Button
									variant="outline"
									size="icon"
									onClick={handleBrowseDirectory}
								>
									<FolderOpen className="h-4 w-4" />
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">
								The directory where OrcaSlicer stores filament
								profiles
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Sync Settings */}
				<Card>
					<CardHeader>
						<CardTitle>Sync Settings</CardTitle>
						<CardDescription>
							Configure automatic synchronization behavior
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div className="space-y-0.5">
								<Label htmlFor="autoSync">Auto-Sync</Label>
								<p className="text-sm text-muted-foreground">
									Automatically sync profiles to OrcaSlicer
								</p>
							</div>
							<Switch
								id="autoSync"
								checked={autoSyncEnabled}
								onCheckedChange={setAutoSyncEnabled}
							/>
						</div>

						<Separator />

						<div className="space-y-2">
							<Label>Last Sync</Label>
							<p className="text-sm text-muted-foreground">
								{formatLastSyncTime(lastSyncTime)}
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Application Info */}
				<Card>
					<CardHeader>
						<CardTitle>Application Info</CardTitle>
						<CardDescription>
							Information about SpoolSync
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label>Version</Label>
							<p className="text-sm text-muted-foreground">
								0.1.0
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Action Buttons */}
			<div className="flex gap-4">
				<Button onClick={handleSaveSettings}>
					<Save className="mr-2 h-4 w-4" />
					Save Settings
				</Button>
				<Button variant="outline" onClick={handleResetSettings}>
					<RotateCcw className="mr-2 h-4 w-4" />
					Reset to Defaults
				</Button>
			</div>
		</div>
	);
}
