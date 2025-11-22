export interface FilamentProfile {
  id: string;
  brand: string;
  color: string; // Hex code or name
  type: 'PLA' | 'PETG' | 'ABS' | 'ASA' | 'TPU' | string;
  costPerKg: number;
  flowRatio: number;
  printerId?: string;
  // Add other OrcaSlicer specific fields as needed later
}
