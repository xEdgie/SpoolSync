/** @format */

import { FilamentProfile } from "@/types/profile";

export function generateFilamentJson(profile: FilamentProfile): string {
	const json = {
		// Filament Basic
		compatible_printers: [profile.printerName],
		filament_type: [profile.type],
		filament_vendor: [profile.brand],
		filament_cost: [(profile.costPerKg || "0").toString()],
		filament_soluble: ["0"],
		filament_is_support: [profile.isSupportMaterial ? "1" : "0"],
		default_filament_colour: [profile.color],
		filament_diameter: [(profile.diameter || "1.75").toString()],
		filament_density: [(profile.density || "1.24").toString()],
		filament_shrink: [(profile.shrinkageXY || "100").toString()],
		filament_shrinkage_compensation_z: [
			(profile.shrinkageZ || "100").toString(),
		],
		idle_temperature: ["0"],
		nozzle_temperature_range_low: [
			(profile.nozzleTempRangeLow || "190").toString(),
		],
		nozzle_temperature_range_high: [
			(profile.nozzleTempRangeHigh || "240").toString(),
		],

		// Filament Flow and Preasure Advance
		filament_flow_ratio: [(profile.flowRatio || "1").toString()],
		enable_pressure_advance: [
			(profile.enablePressureAdvance ?? true).toString(),
		],
		pressure_advance: [(profile.pressureAdvance || "0.03").toString()],

		// Filament Chamber Temperature
		chamber_temperature: [(profile.chamberTemp || "0").toString()],
    // if true then 1 else 0
		activate_chamber_temp_control: [
			(profile.chamberTempControl ?? false).toString() === "true" ? "1" : "0",
		],

		//Filament Print Temperature
		nozzle_temperature_initial_layer: [
			(profile.initialNozzleTemp || "220").toString(),
		],
		nozzle_temperature: [(profile.nozzleTemp || "220").toString()],

		// Filament Bed Temperature
		bed_temperature_initial_layer: [
			(profile.initialBedTemp || "60").toString(),
		],
		bed_temperature: [(profile.bedTemp || "60").toString()],

		// Filament Hidden Settings
		filament_settings_id: [`${profile.brand} ${profile.type}`],
		from: "User",
		inherits: `Generic ${profile.type} @System`,
		is_custom_defined: "1",
		name: `${profile.brand} ${profile.type}`,
		version: "2.3.1.0",

		// Filament Cooling
		fan_cooling_layer_time: [
			(profile.minFanSpeedLayerTime || "60").toString(),
		],
		fan_min_speed: [(profile.fanSpeedMin || "100").toString()],
		fan_max_speed: [(profile.fanSpeedMax || "100").toString()],

		// Overrides Retraction
    // if enableRetraction is true then include the key
    ...(profile.enableRetraction
      ?{
        filament_retraction_length: [
          (profile.retractionLength || "nil").toString(),
        ]
      }
      :
      {}),
    
    // if zhop type is not none then include the key
    ...(profile.zhopType !== "None" ? {filament_z_hop_types: [(profile.zhopType || "nil").toString()]} : {}),

		//if enableRetractionLiftAbove is true then use profile.retractLiftAbove else dont include the key
		...(profile.enableRetractionLiftAbove
			? {
					filament_retract_lift_above: [
						(profile.retractLiftAbove || "0").toString(),
					],
			  }
			: {}),

		//if enableRetractionLiftBelow is true then use profile.retractLiftBelow else dont include the key
		...(profile.enableRetractionLiftBelow
			? {
					filament_retract_lift_below: [
						(profile.retractLiftBelow || "0").toString(),
					],
			  }
			: {}),
	};

	return JSON.stringify(json, null, 2);
}
