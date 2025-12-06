/** @format */

export interface FilamentProfile {
  // Filament Basic
  id: string;
  printerName?: string;
  printerId?: string;
  brand: string;
  color: string; // Hex code or name
  type: "PLA" | "PETG" | "ABS" | "ASA" | "TPU" | string;
  costPerKg?: string;
  isSupportMaterial?: boolean;
  diameter?: string;
  density?: string;
  shrinkageXY?: string;
  shrinkageZ?: string;
  nozzleTempRangeLow?: string;
  nozzleTempRangeHigh?: string;

  // Filament Flow and Preasure Advance
  flowRatio?: string;
  enablePressureAdvance?: boolean;
  pressureAdvance?: string;

  //Filament Chamber Temperature
  chamberTemp?: string;
  chamberTempControl?: boolean;

  // Filament Print Temperature
  initialNozzleTemp?: string;
  nozzleTemp?: string;

  // Filament Bed Temperature
  initialBedTemp?: string;
  bedTemp?: string;

  // Filament Cooling
  fanSpeedMin?: string;
  fanSpeedMax?: string;
  minFanSpeedLayerTime?: string;

  // Overrides Retraction
  retractionLength?: string;
  zhopHeight?: string;
  zhopType?:
    | "Auto Lift"
    | "Normal Lift"
    | "Slope Lift"
    | "Spiral Lift"
    | string;
  retractLiftAbove?: string;
  retractLiftBelow?: string;
}
