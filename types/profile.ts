/** @format */

export interface FilamentProfile {
	id: string;
	printerId?: string;
	printerName?: string;
	brand: string;
	color: string; // Hex code or name
	type: "PLA" | "PETG" | "ABS" | "ASA" | "TPU" | string;
	costPerKg: number;
	initialNozzleTemp: number;
	nozzleTemp: number;
	initialBedTemp: number;
	bedTemp: number;
	flowRatio: number;
	retractionLength: number;
	zhopHeight: number;
	zhopType:
		| "Auto Lift"
		| "Normal Lift"
		| "Slope Lift"
		| "Spiral Lift"
		| string;
	// Add other OrcaSlicer specific fields as needed later
}
