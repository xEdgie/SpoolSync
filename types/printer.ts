export interface Printer {
  id: string;
  name: string;
  // Machine limits
  model: string;
  nozzleDiameter: number;
  bedSizeX: number;
  bedSizeY: number;
  maxPrintHeight: number;

  // Extruder
    // Retraction
    retractionLength: number;
    retractionSpeed: number;
    deretractionSpeed: number;
    retractionType: "firmware" | "software";

    // Z-Hop
    zhopHeight?: string;
    zhopType?:
      | "None"
      | "Auto Lift"
      | "Normal Lift"
      | "Slope Lift"
      | "Spiral Lift"
      | string;
    retractLiftAbove?: string;
    retractLiftBelow?: string;

  // Speed limits
  maxPrintSpeed: number;
  maxTravelSpeed: number;
  maxAccelerationX: number;
  maxAccelerationY: number;
  maxAccelerationZ: number;
  maxAccelerationE: number;

  // Gcode
  gcodeFlavor: "marlin" | "klipper" | "reprap" | "bambu";
  startGcode: string;
  endGcode: string;

  // Cooling
  auxiliaryFan: boolean;
}
