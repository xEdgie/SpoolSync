/** @format */

export interface FilamentProfile {
	// Filament Basic
	id: string;
	printerName?: string;
	printerId?: string;
	brand: string;
	color: string; // Hex code or name
	type: "PLA" | "PETG" | "ABS" | "ASA" | "TPU" | string;
	costPerKg: number;
	isSupportMaterial: boolean;
	diameter: number;
	density: number;
	shrinkageXY: number;
	shrinkageZ: number;
	nozzleTempRangeLow: number;
	nozzleTempRangeHigh: number;
	
	// Filament Flow and Preasure Advance
	flowRatio: number;
	enablePressureAdvance: boolean;
	pressureAdvance: number;
	
	//Filament Chamber Temperature
	chamberTemp: number;
	chamberTempControl: boolean;
	
	// Filament Print Temperature
	initialNozzleTemp: number;
	nozzleTemp: number;
	
	// Filament Bed Temperature
	initialBedTemp: number;
	bedTemp: number;

	// Filament Cooling
	fanSpeedMin?: number;
	fanSpeedMax?: number;
	minFanSpeedLayerTime?: number;
	
	// Overrides Retraction
	retractionLength: number;
	zhopHeight: number;
	zhopType:
		| "Auto Lift"
		| "Normal Lift"
		| "Slope Lift"
		| "Spiral Lift"
		| string;
	retractLiftAbove: number;
	retractLiftBelow: number;
}
