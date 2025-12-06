/** @format */

import { FilamentProfile } from "@/types/profile";

export function generateFilamentJson(profile: FilamentProfile): string {
	const json = {
		// Filament Basic
		compatible_printers: [profile.printerName],
		filament_type: [profile.type],
		filament_vendor: [profile.brand],
		filament_cost: [profile.costPerKg],
		filament_soluble: [false],
		filament_is_support: [profile.isSupportMaterial || false],
		default_filament_colour: [profile.color],
		filament_diameter: [profile.diameter || 1.75],
		filament_density: [profile.density || 1.24],
		filament_shrink: [profile.shrinkageXY || 100],
		filament_shrinkage_compensation_z: [profile.shrinkageZ || 100],
		idle_temperature: [0],
		nozzle_temperature_range_low: [profile.nozzleTempRangeLow || 190],
		nozzle_temperature_range_high: [profile.nozzleTempRangeHigh || 240],
		
		// Filament Flow and Preasure Advance
		filament_flow_ratio: [profile.flowRatio || 1],
		enable_pressure_advance: [profile.enablePressureAdvance || true],
		pressure_advance: [profile.pressureAdvance || 0],

		// Filament Chamber Temperature
		chamber_temperature: [profile.chamberTemp || 0],
		activate_chamber_temp_control: [profile.chamberTempControl || false],

		//Filament Print Temperature
		nozzle_temperature_initial_layer: [profile.initialNozzleTemp || 220],
		nozzle_temperature: [profile.nozzleTemp || 220],

		// Filament Bed Temperature
		bed_temperature_initial_layer: [profile.initialBedTemp || 60],
		bed_temperature: [profile.bedTemp || 60],

		// Filament Hidden Settings
		filament_settings_id: [`${profile.brand} ${profile.type}`],
		from: "User",
		inherits: "Generic PLA", // Could be dynamic
		is_custom_defined: "1",
		name: `${profile.brand} ${profile.type}`,
		version: "1.0.0.0",
		
		// Filament Cooling
		fan_cooling_layer_time: [
			profile.minFanSpeedLayerTime || 60,
		],
		fan_min_speed: [profile.fanSpeedMin || 100],
		fan_max_speed: [profile.fanSpeedMax || 100],

		// Overrides Retraction
		filament_retraction_length: [
			profile.retractionLength || "nil",
		],
		filament_z_hop: [profile.zhopHeight || 0],
		filament_z_hop_types: [profile.zhopType || "nil"],
		filament_retract_lift_above: [profile.retractLiftAbove || 0],
		filament_retract_lift_below: [profile.retractLiftBelow || 0],
	};

	return JSON.stringify(json, null, 2);
}
