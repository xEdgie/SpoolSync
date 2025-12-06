/** @format */

import { FilamentProfile } from "@/types/profile";

export function generateFilamentJson(profile: FilamentProfile): string {
  const json = {
    // Filament Basic
    compatible_printers: [profile.printerName],
    filament_type: [profile.type],
    filament_vendor: [profile.brand],
    filament_cost: [profile.costPerKg.toString()],
    filament_soluble: ["0"],
    filament_is_support: [profile.isSupportMaterial.toString() || "0"],
    default_filament_colour: [profile.color],
    filament_diameter: [profile.diameter.toString() || "1.75"],
    filament_density: [profile.density.toString() || "1.24"],
    filament_shrink: [profile.shrinkageXY.toString() || "100"],
    filament_shrinkage_compensation_z: [profile.shrinkageZ.toString() || "100"],
    idle_temperature: [0],
    nozzle_temperature_range_low: [
      profile.nozzleTempRangeLow.toString() || "190",
    ],
    nozzle_temperature_range_high: [
      profile.nozzleTempRangeHigh.toString() || "240",
    ],

    // Filament Flow and Preasure Advance
    filament_flow_ratio: [profile.flowRatio.toString() || "1"],
    enable_pressure_advance: [profile.enablePressureAdvance.toString() || "1"],
    pressure_advance: [profile.pressureAdvance.toString() || "0.03"],

    // Filament Chamber Temperature
    chamber_temperature: [profile.chamberTemp.toString() || "0"],
    activate_chamber_temp_control: [
      profile.chamberTempControl.toString() || "0",
    ],

    //Filament Print Temperature
    nozzle_temperature_initial_layer: [
      profile.initialNozzleTemp.toString() || "220",
    ],
    nozzle_temperature: [profile.nozzleTemp.toString() || "220"],

    // Filament Bed Temperature
    bed_temperature_initial_layer: [profile.initialBedTemp.toString() || "60"],
    bed_temperature: [profile.bedTemp.toString() || "60"],

    // Filament Hidden Settings
    filament_settings_id: [`${profile.brand} ${profile.type}`],
    from: "User",
    inherits: "Generic PLA", // Could be dynamic
    is_custom_defined: "0",
    name: `${profile.brand} ${profile.type}`,
    version: "1.0.0.0",

    // Filament Cooling
    fan_cooling_layer_time: [profile.minFanSpeedLayerTime.toString() || "60"],
    fan_min_speed: [profile.fanSpeedMin.toString() || "100"],
    fan_max_speed: [profile.fanSpeedMax.toString() || "100"],

    // Overrides Retraction
    filament_retraction_length: [profile.retractionLength.toString() || "nil"],
    filament_z_hop: [profile.zhopHeight.toString() || "0"],
    filament_z_hop_types: [profile.zhopType.toString() || "nil"],
    filament_retract_lift_above: [profile.retractLiftAbove.toString() || "0"],
    filament_retract_lift_below: [profile.retractLiftBelow.toString() || "0"],
  };

  return JSON.stringify(json, null, 2);
}
